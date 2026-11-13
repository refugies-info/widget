import { ar } from "./translations/ar.js";
import { en } from "./translations/en.js";
import { fa } from "./translations/fa.js";
import { fr } from "./translations/fr.js";
import { ps } from "./translations/ps.js";
import { ru } from "./translations/ru.js";
import { ti } from "./translations/ti.js";
import { uk } from "./translations/uk.js";

export interface Wording {
  translateLabel: string;
  translateHint: string;
  sourceLong: string;
  emptyTitle: string;
  emptyText: string;
  translateInLabel: string;
  resultsCount_one: string;
  resultsCount_other: string;
  previousPage: string;
  nextPage: string;
  pageLabel: string;
  paginationLabel: string;
  baseline: string;
  cardFree: string;
  cardUpdated: string;
  cardUpdatedOverYear: string;
  badgeProcedure: string;
  locationFrance: string;
  locationOnline: string;
  locationDepartments: string;
  unitSessions_one: string;
  unitSessions_other: string;
  unitHalfDays_one: string;
  unitHalfDays_other: string;
  noResults: string;
  loadError: string;
  filterSearch: string;
  filterLocation: string;
  filterTheme: string;
  filterStatus: string;
  filterPublic: string;
  filterAge: string;
  filterFrenchLevel: string;
  filterLanguage: string;
  filtersClear: string;
  filterRemove: string;
  filterReset: string;
  filtersTitle: string;
  filtersClose: string;
  seeResults_one: string;
  seeResults_other: string;
  locationSearchPlaceholder: string;
  locationUseMyPosition: string;
  locationPositionError: string;
  locationCommonCities: string;
  locationSelected: string;
  locationResults: string;
  locationNoResults: string;
  locationDepartment: string;
  locationCity: string;
  statusAsile: string;
  statusRefugie: string;
  statusSubsidiaire: string;
  statusTemporaire: string;
  statusApatride: string;
  statusFrench: string;
  publicFamily: string;
  publicWomen: string;
  publicYouths: string;
  publicSenior: string;
  publicGender: string;
  ageUnder18: string;
  age18To25: string;
  ageOver25: string;
  frenchLevelAlpha: string;
  frenchLevelA: string;
  frenchLevelB: string;
  frenchLevelC: string;
}

export type WordingKey = keyof Wording;
type PluralBase = "resultsCount" | "seeResults" | "unitSessions" | "unitHalfDays";
type Values = Record<string, string | number>;

const WORDING: Record<string, Partial<Wording>> & { fr: Wording } = {
  fr,
  en,
  ar,
  ps,
  fa,
  uk,
  ru,
  ti,
};

const interpolate = (text: string, values?: Values) =>
  values ? text.replace(/\{(\w+)\}/g, (placeholder, name) => String(values[name] ?? placeholder)) : text;

export const t = (locale: string, key: WordingKey, values?: Values) =>
  interpolate(WORDING[locale]?.[key] || WORDING.fr[key], values);

export const translateExact = (locale: string, key: WordingKey) => WORDING[locale]?.[key] || undefined;

const pluralKey = (base: PluralBase, category: Intl.LDMLPluralRule): WordingKey =>
  category === "one" ? `${base}_one` : `${base}_other`;

const pluralCategory = (locale: string, count: number) =>
  new Intl.PluralRules(locale).select(count);

export const translateCount = (locale: string, base: PluralBase, count: number) => {
  const dictionary = WORDING[locale];
  const text =
    dictionary?.[pluralKey(base, pluralCategory(locale, count))] ||
    dictionary?.[pluralKey(base, "other")];
  return text
    ? interpolate(text, { count })
    : t("fr", pluralKey(base, pluralCategory("fr", count)), { count });
};
