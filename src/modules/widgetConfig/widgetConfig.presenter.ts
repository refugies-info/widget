import type { WidgetConfig } from "./widgetConfig.schema.js";

export type PublicWidgetConfig = Pick<
  WidgetConfig,
  | "publicId"
  | "type"
  | "externalTitle"
  | "description"
  | "displayDescription"
  | "pageSize"
  | "sortBy"
  | "displayShareModule"
  | "displayFilterBar"
  | "filterBarOptions"
>;

// Whitelist: a field added to the schema is never exposed unless it is listed here
export const toPublicWidgetConfig = (config: WidgetConfig): PublicWidgetConfig => ({
  publicId: config.publicId,
  type: config.type,
  externalTitle: config.externalTitle,
  description: config.displayDescription ? config.description : undefined,
  displayDescription: config.displayDescription,
  pageSize: config.pageSize,
  sortBy: config.sortBy,
  displayShareModule: config.displayShareModule,
  displayFilterBar: config.displayFilterBar,
  filterBarOptions: config.filterBarOptions,
});
