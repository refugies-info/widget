import { ObjectId } from "mongodb";
import { z } from "zod";
import { DEPARTMENT_NAMES } from "../filterOptions/departments.js";
import {
  WIDGET_CONFIG_AGES,
  WIDGET_CONFIG_FRENCH_LEVELS,
  type WidgetConfig,
} from "../widgetConfig/widgetConfig.schema.js";
import type { MatchFilters } from "./dispositif.match.js";

const PUBLICS = ["family", "women", "youths", "senior", "gender"] as const;
const STATUSES = ["asile", "refugie", "subsidiaire", "temporaire", "apatride", "french"] as const;

export const MAX_SEARCH_LENGTH = 100;
const MAX_VALUES = 30;

const list = <T extends z.ZodType>(item: T) =>
  z.preprocess(
    (value) => (value === undefined || Array.isArray(value) ? value : [value]),
    z.array(item).max(MAX_VALUES).optional(),
  );

const objectIdParam = z
  .string()
  .regex(/^[0-9a-f]{24}$/i)
  .transform((value) => new ObjectId(value));

export const visitorFiltersQuerySchema = z.object({
  search: z.string().trim().max(MAX_SEARCH_LENGTH).optional(),
  departments: list(z.enum(DEPARTMENT_NAMES)),
  cities: list(z.string().trim().min(1).max(MAX_SEARCH_LENGTH)),
  themes: list(objectIdParam),
  publics: list(z.enum(PUBLICS)),
  statuses: list(z.enum(STATUSES)),
  frenchLevels: list(z.enum(WIDGET_CONFIG_FRENCH_LEVELS)),
  ages: list(z.enum(WIDGET_CONFIG_AGES)),
  languages: list(z.string().regex(/^[a-z]{2,3}(-[a-zA-Z]{2,4})?$/)),
});

type VisitorFiltersQuery = z.infer<typeof visitorFiltersQuerySchema>;

// The parameter of the route each option of the filter bar unlocks
const PARAMETER_BY_OPTION = {
  keyword: ["search"],
  location: ["departments", "cities"],
  theme: ["themes"],
  public: ["publics"],
  status: ["statuses"],
  frenchLevel: ["frenchLevels"],
  age: ["ages"],
  language: ["languages"],
} as const satisfies Record<string, readonly (keyof VisitorFiltersQuery)[]>;

export interface VisitorFilters {
  keyword?: string;
  filters: MatchFilters;
}

export const pickEnabledVisitorFilters = (
  config: WidgetConfig,
  query: VisitorFiltersQuery,
): VisitorFilters => {
  if (config.type !== "list" || !config.displayFilterBar) return { filters: {} };

  const enabled = new Set<string>(
    config.filterBarOptions.flatMap((option) => PARAMETER_BY_OPTION[option]),
  );
  const { search, ...filters } = query;
  const kept = Object.fromEntries(
    Object.entries(filters).filter(([parameter]) => enabled.has(parameter)),
  ) as MatchFilters;

  return {
    keyword: enabled.has("search") && search ? search : undefined,
    filters: kept,
  };
};
