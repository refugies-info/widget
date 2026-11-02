import { describe, expect, it, vi } from "vitest";
import { DEPARTMENT_NAMES } from "./departments.js";
import type { FilterOptionsRepository } from "./filterOptions.repository.js";
import { findFilterOptions } from "./filterOptions.service.js";

const themes = [{ id: "64b7f0c2a1d3e4f5a6b7c8d9", name: "Se loger", color: "#fff" }];
const languages = [{ code: "ar", name: "Arabe", localName: "العربية" }];

const buildRepository = () => {
  const repository: FilterOptionsRepository = {
    findThemes: vi.fn(async () => themes),
    findLanguages: vi.fn(async () => languages),
  };
  return repository;
};

describe("findFilterOptions", () => {
  it("only reads and returns the values of the options of the filter bar", async () => {
    const repository = buildRepository();

    const options = await findFilterOptions(
      { displayFilterBar: true, filterBarOptions: ["keyword", "theme", "age"] },
      "en",
      repository,
    );

    expect(options).toEqual({ themes });
    expect(repository.findThemes).toHaveBeenCalledWith("en");
    expect(repository.findLanguages).not.toHaveBeenCalled();
  });

  it("offers the departments, the themes and the languages when all are enabled", async () => {
    const options = await findFilterOptions(
      { displayFilterBar: true, filterBarOptions: ["location", "theme", "language"] },
      "fr",
      buildRepository(),
    );

    expect(options).toEqual({ departments: DEPARTMENT_NAMES, themes, languages });
  });

  it("offers nothing when the filter bar is hidden", async () => {
    const repository = buildRepository();

    const options = await findFilterOptions(
      { displayFilterBar: false, filterBarOptions: ["theme", "language", "location"] },
      "fr",
      repository,
    );

    expect(options).toEqual({});
    expect(repository.findThemes).not.toHaveBeenCalled();
  });
});
