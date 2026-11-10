import type { WordingKey } from "./wording.js";

export const MAX_SELECTED_VALUES = 30;

export type FilterKey =
  | "departments"
  | "cities"
  | "themes"
  | "statuses"
  | "publics"
  | "ages"
  | "frenchLevels"
  | "languages";

export type Filters = Record<FilterKey, string[]> & { search: string };

export const emptyFilters = (): Filters => ({
  search: "",
  departments: [],
  cities: [],
  themes: [],
  statuses: [],
  publics: [],
  ages: [],
  frenchLevels: [],
  languages: [],
});

export interface Option {
  value: string;
  label: WordingKey;
}

export interface FilterConfiguration {
  type: string;
  key: FilterKey;
  label: WordingKey;
  options?: Option[];
}

export const FILTER_CONFIGURATIONS: FilterConfiguration[] = [
  { type: "location", key: "departments", label: "filterLocation" },
  { type: "theme", key: "themes", label: "filterTheme" },
  {
    type: "status",
    key: "statuses",
    label: "filterStatus",
    options: [
      { value: "asile", label: "statusAsile" },
      { value: "refugie", label: "statusRefugie" },
      { value: "subsidiaire", label: "statusSubsidiaire" },
      { value: "apatride", label: "statusApatride" },
      { value: "temporaire", label: "statusTemporaire" },
      { value: "french", label: "statusFrench" },
    ],
  },
  {
    type: "public",
    key: "publics",
    label: "filterPublic",
    options: [
      { value: "family", label: "publicFamily" },
      { value: "women", label: "publicWomen" },
      { value: "youths", label: "publicYouths" },
      { value: "gender", label: "publicGender" },
      { value: "senior", label: "publicSenior" },
    ],
  },
  {
    type: "age",
    key: "ages",
    label: "filterAge",
    options: [
      { value: "-18", label: "ageUnder18" },
      { value: "18-25", label: "age18To25" },
      { value: "+25", label: "ageOver25" },
    ],
  },
  {
    type: "frenchLevel",
    key: "frenchLevels",
    label: "filterFrenchLevel",
    options: [
      { value: "alpha", label: "frenchLevelAlpha" },
      { value: "a", label: "frenchLevelA" },
      { value: "b", label: "frenchLevelB" },
      { value: "c", label: "frenchLevelC" },
    ],
  },
  { type: "language", key: "languages", label: "filterLanguage" },
];

export const FRENCH_LEVEL_SHORT_LABELS: Record<string, string> = {
  alpha: "Alpha",
  a: "A1/A2",
  b: "B1/B2",
  c: "C1/C2",
};

export const hasSearch = (filterBarOptions: string[]) => filterBarOptions.includes("keyword");

export const enabledFilters = (filterBarOptions: string[]) =>
  FILTER_CONFIGURATIONS.filter(({ type }) => filterBarOptions.includes(type));

export const keysOf = ({ type, key }: FilterConfiguration): FilterKey[] =>
  type === "location" ? ["departments", "cities"] : [key];

export const FILTER_KEYS: FilterKey[] = FILTER_CONFIGURATIONS.flatMap(keysOf);

export const hasActiveFilters = (filters: Filters) =>
  filters.search.trim() !== "" || FILTER_KEYS.some((key) => filters[key].length > 0);

export const sameFilters = (a: Filters, b: Filters) =>
  a.search === b.search &&
  FILTER_KEYS.every((key) => a[key].length === b[key].length && a[key].every((value, index) => value === b[key][index]));

export const toggleValue = (values: string[], value: string) => {
  if (values.includes(value)) return values.filter((selected) => selected !== value);
  return values.length >= MAX_SELECTED_VALUES ? values : [...values, value];
};

export const buildListQuery = (locale: string, page: number, filters: Filters) => {
  const query = new URLSearchParams({ locale, page: String(page) });
  const search = filters.search.trim();
  if (search) query.set("search", search);
  for (const key of FILTER_KEYS) {
    for (const value of filters[key]) query.append(key, value);
  }
  return query;
};
