import { getJson } from "./api.js";
import { toggleValue } from "./filters.js";

const MUNICIPALITIES_URL = "https://data.geopf.fr/geocodage/search";
const DEPARTMENTS_URL = "https://geo.api.gouv.fr/departements";
const COMMUNES_URL = "https://geo.api.gouv.fr/communes";

export const MIN_SEARCH_LENGTH = 3;
const MAX_SUGGESTIONS = 5;

export interface LocationSuggestion {
  type: "city" | "department";
  name: string;
  departmentCode: string;
  departmentName: string;
}

export interface LocationSelection {
  departments: string[];
  cities: string[];
}

const city = (name: string, departmentCode: string, departmentName: string): LocationSuggestion => ({
  type: "city",
  name,
  departmentCode,
  departmentName,
});

export const COMMON_CITIES: LocationSuggestion[] = [
  city("Paris", "75", "Paris"),
  city("Lyon", "69", "Rhône"),
  city("Strasbourg", "67", "Bas-Rhin"),
  city("Nantes", "44", "Loire-Atlantique"),
  city("Dijon", "21", "Côte-d'Or"),
  city("Bordeaux", "33", "Gironde"),
  city("Grenoble", "38", "Isère"),
  city("Toulouse", "31", "Haute-Garonne"),
  city("Rennes", "35", "Ille-et-Vilaine"),
  city("Marseille", "13", "Bouches-du-Rhône"),
];

const departmentOfCity = new Map<string, string>(
  COMMON_CITIES.map(({ name, departmentName }) => [name, departmentName]),
);

export const toggleCity = (
  { departments, cities }: LocationSelection,
  suggestion: LocationSuggestion,
): LocationSelection => {
  if (cities.includes(suggestion.name)) {
    return { departments, cities: cities.filter((selected) => selected !== suggestion.name) };
  }
  departmentOfCity.set(suggestion.name, suggestion.departmentName);
  return {
    departments: departments.includes(suggestion.departmentName)
      ? departments
      : toggleValue(departments, suggestion.departmentName),
    cities: toggleValue(cities, suggestion.name),
  };
};

export const toggleDepartment = (
  { departments, cities }: LocationSelection,
  department: string,
): LocationSelection =>
  departments.includes(department)
    ? {
        departments: departments.filter((selected) => selected !== department),
        cities: cities.filter((selected) => departmentOfCity.get(selected) !== department),
      }
    : { departments: toggleValue(departments, department), cities };

export const addDepartment = (selection: LocationSelection, department: string): LocationSelection =>
  selection.departments.includes(department) ? selection : toggleDepartment(selection, department);

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("fr");

const score = ({ type, name }: LocationSuggestion, search: string) => {
  const normalized = normalize(name);
  const rank = normalized === search ? 3 : normalized.startsWith(search) ? 2 : normalized.includes(search) ? 1 : 0;
  return rank * 2 + (type === "department" ? 1 : 0);
};

export const rankSuggestions = (suggestions: LocationSuggestion[], search: string) => {
  const normalized = normalize(search);
  return suggestions
    .map((suggestion) => ({ suggestion, score: score(suggestion, normalized) }))
    .sort((a, b) => b.score - a.score || a.suggestion.name.localeCompare(b.suggestion.name, "fr"))
    .map(({ suggestion }) => suggestion)
    .slice(0, MAX_SUGGESTIONS);
};

const getJsonOr = <T>(url: string, signal: AbortSignal, fallback: T) =>
  getJson<T>(url, signal).catch(() => fallback);

interface MunicipalityResponse {
  features?: { properties: { name: string; context: string } }[];
}

export const searchLocations = async (search: string, signal: AbortSignal) => {
  const [municipalities, departments] = await Promise.all([
    getJsonOr<MunicipalityResponse>(
      `${MUNICIPALITIES_URL}?${new URLSearchParams({ q: search, type: "municipality" })}`,
      signal,
      {},
    ),
    getJsonOr<{ code: string; nom: string }[]>(
      `${DEPARTMENTS_URL}?${new URLSearchParams({ nom: search })}`,
      signal,
      [],
    ),
  ]);

  const suggestions: LocationSuggestion[] = [
    ...(municipalities.features ?? []).flatMap(({ properties }) => {
      const [code, departmentName] = properties.context.split(", ");
      return code && departmentName ? [city(properties.name, code, departmentName)] : [];
    }),
    ...departments.map(
      ({ code, nom }): LocationSuggestion => ({ type: "department", name: nom, departmentCode: code, departmentName: nom }),
    ),
  ];
  const unique = [...new Map(suggestions.map((s) => [`${s.type}:${s.name}:${s.departmentCode}`, s])).values()];
  return rankSuggestions(unique, search);
};

export const findDepartmentAt = async (latitude: number, longitude: number, signal: AbortSignal) => {
  const communes = await getJsonOr<{ departement?: { nom: string } }[]>(
    `${COMMUNES_URL}?${new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      fields: "departement",
      geometry: "centre",
    })}`,
    signal,
    [],
  );
  return communes[0]?.departement?.nom ?? null;
};

export const canGeolocate = () => typeof navigator !== "undefined" && "geolocation" in navigator;

export const getCurrentPosition = () =>
  new Promise<GeolocationCoordinates>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve(coords), reject),
  );
