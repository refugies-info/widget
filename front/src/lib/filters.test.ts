import { describe, expect, it } from "vitest";
import {
  buildListQuery,
  emptyFilters,
  enabledFilters,
  hasActiveFilters,
  MAX_SELECTED_VALUES,
  sameFilters,
  toggleValue,
} from "./filters.js";

describe("buildListQuery", () => {
  it("only has the locale and the page without filters", () => {
    expect(buildListQuery("fr", 2, emptyFilters()).toString()).toBe("locale=fr&page=2");
  });

  it("repeats the parameter of a filter for each value, and trims the keyword", () => {
    const filters = { ...emptyFilters(), search: "  logement ", themes: ["a", "b"], ages: ["+25"] };
    const query = buildListQuery("en", 1, filters);

    expect(query.get("search")).toBe("logement");
    expect(query.getAll("themes")).toEqual(["a", "b"]);
    expect(query.getAll("ages")).toEqual(["+25"]);
  });

  it("ignores a blank keyword", () => {
    expect(buildListQuery("fr", 1, { ...emptyFilters(), search: "   " }).has("search")).toBe(false);
  });
});

describe("toggleValue", () => {
  it("adds a value, then removes it", () => {
    expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
  });

  it("does not go over the number of values the API accepts", () => {
    const full = Array.from({ length: MAX_SELECTED_VALUES }, (_, index) => String(index));
    expect(toggleValue(full, "new")).toEqual(full);
    expect(toggleValue(full, "0")).toHaveLength(MAX_SELECTED_VALUES - 1);
  });
});

describe("sameFilters and hasActiveFilters", () => {
  it("compares the keyword and every list", () => {
    expect(sameFilters(emptyFilters(), emptyFilters())).toBe(true);
    expect(sameFilters(emptyFilters(), { ...emptyFilters(), search: "a" })).toBe(false);
    expect(sameFilters({ ...emptyFilters(), themes: ["a"] }, { ...emptyFilters(), themes: ["b"] })).toBe(false);
  });

  it("knows when something is selected", () => {
    expect(hasActiveFilters(emptyFilters())).toBe(false);
    expect(hasActiveFilters({ ...emptyFilters(), search: "  " })).toBe(false);
    expect(hasActiveFilters({ ...emptyFilters(), publics: ["women"] })).toBe(true);
  });
});

describe("enabledFilters", () => {
  it("keeps the filters of the config, in the order of the design", () => {
    const keys = enabledFilters(["age", "keyword", "theme"]).map(({ key }) => key);
    expect(keys).toEqual(["themes", "ages"]);
  });
});
