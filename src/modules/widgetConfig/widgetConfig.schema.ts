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

export const widgetConfigSchema = z.object({
  publicId: z.string(),
  status: z.enum(WIDGET_CONFIG_STATUSES),
  type: z.enum(WIDGET_CONFIG_TYPES),
  authorizedDomains: z.array(z.string()),
  externalTitle: z.string(),
  description: z.string().optional(),
  displayDescription: z.boolean(),
  pageSize: z.number(),
  sortBy: z.enum(WIDGET_CONFIG_SORT_OPTIONS),
  displayShareModule: z.boolean(),
  displayFilterBar: z.boolean(),
  filterBarOptions: z.array(z.enum(WIDGET_CONFIG_FILTER_BAR_OPTIONS)),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;
