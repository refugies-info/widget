import type {
  ListWidgetConfig,
  ThumbnailWidgetConfig,
  WidgetConfig,
} from "./widgetConfig.schema.js";

export type PublicListWidgetConfig = Pick<
  ListWidgetConfig,
  | "publicId"
  | "type"
  | "authorizedDomains"
  | "externalTitle"
  | "description"
  | "displayDescription"
  | "pageSize"
  | "sortBy"
  | "displayShareModule"
  | "displayFilterBar"
  | "filterBarOptions"
>;

export type PublicThumbnailWidgetConfig = Pick<
  ThumbnailWidgetConfig,
  "publicId" | "type" | "authorizedDomains" | "externalTitle"
>;

export type PublicWidgetConfig = PublicListWidgetConfig | PublicThumbnailWidgetConfig;

export const toPublicWidgetConfig = (config: WidgetConfig): PublicWidgetConfig => {
  const { publicId, authorizedDomains, externalTitle } = config;
  const commonFields = { publicId, authorizedDomains, externalTitle };

  if (config.type === "thumbnail") {
    return { ...commonFields, type: config.type };
  }

  return {
    ...commonFields,
    type: config.type,
    description: config.displayDescription ? config.description : undefined,
    displayDescription: config.displayDescription,
    pageSize: config.pageSize,
    sortBy: config.sortBy,
    displayShareModule: config.displayShareModule,
    displayFilterBar: config.displayFilterBar,
    filterBarOptions: config.filterBarOptions,
  };
};
