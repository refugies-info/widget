import type { ListWidgetConfig } from "../widgetConfig/widgetConfig.schema.js";
import { DEPARTMENT_NAMES } from "./departments.js";
import type {
  FilterOptionsRepository,
  LanguageOption,
  ThemeOption,
} from "./filterOptions.repository.js";

export interface FilterOptions {
  departments?: readonly string[];
  themes?: ThemeOption[];
  languages?: LanguageOption[];
}

export const findFilterOptions = async (
  {
    displayFilterBar,
    filterBarOptions,
  }: Pick<ListWidgetConfig, "displayFilterBar" | "filterBarOptions">,
  locale: string,
  repository: FilterOptionsRepository,
): Promise<FilterOptions> => {
  if (!displayFilterBar) return {};

  const [themes, languages] = await Promise.all([
    filterBarOptions.includes("theme") ? repository.findThemes(locale) : undefined,
    filterBarOptions.includes("language") ? repository.findLanguages() : undefined,
  ]);

  return {
    departments: filterBarOptions.includes("location") ? DEPARTMENT_NAMES : undefined,
    themes,
    languages,
  };
};
