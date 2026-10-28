import { ObjectId } from "mongodb";
import { z } from "zod";

export const WIDGET_CONFIG_STATUSES = ["active", "inactive"] as const;
export const WIDGET_CONFIG_TYPES = ["list", "thumbnail"] as const;
export const WIDGET_CONFIG_SORT_OPTIONS = ["date", "views", "theme", "location"] as const;
export const WIDGET_CONFIG_FILTER_BAR_OPTIONS = [
  "keyword",
  "location",
  "theme",
  "public",
  "status",
  "frenchLevel",
  "age",
  "language",
] as const;

export const WIDGET_CONFIG_CONTENT_TYPES = ["dispositif", "demarche"] as const;
export const WIDGET_CONFIG_AGES = ["-18", "18-25", "+25"] as const;
export const WIDGET_CONFIG_FRENCH_LEVELS = ["alpha", "a", "b", "c"] as const;

const objectIdSchema = z
  .custom<ObjectId | string>(
    (value) => value instanceof ObjectId || ObjectId.isValid(String(value)),
  )
  .transform((value) => new ObjectId(value));

const widgetConfigFiltersSchema = z.object({
  contentTypes: z.array(z.enum(WIDGET_CONFIG_CONTENT_TYPES)).optional(),
  departments: z.array(z.string()).optional(),
  themes: z.array(objectIdSchema).optional(),
  needs: z.array(objectIdSchema).optional(),
  publics: z.array(z.string()).optional(),
  statuses: z.array(z.string()).optional(),
  frenchLevels: z.array(z.enum(WIDGET_CONFIG_FRENCH_LEVELS)).optional(),
  ages: z.array(z.enum(WIDGET_CONFIG_AGES)).optional(),
  languages: z.array(z.string()).optional(),
});

export type WidgetConfigFilters = z.infer<typeof widgetConfigFiltersSchema>;

export const widgetConfigSchema = z.object({
  publicId: z.string(),
  status: z.enum(WIDGET_CONFIG_STATUSES),
  type: z.enum(WIDGET_CONFIG_TYPES),
  authorizedDomains: z.array(z.string()),
  externalTitle: z.string(),
  description: z.string().optional(),
  displayDescription: z.boolean(),
  filters: widgetConfigFiltersSchema,
  selectedDispositifIds: z.array(objectIdSchema),
  excludedDispositifIds: z.array(objectIdSchema),
  pageSize: z.number(),
  sortBy: z.enum(WIDGET_CONFIG_SORT_OPTIONS),
  displayShareModule: z.boolean(),
  displayFilterBar: z.boolean(),
  filterBarOptions: z.array(z.enum(WIDGET_CONFIG_FILTER_BAR_OPTIONS)),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;
