import { describe, expect, it } from "vitest";
import {
  addDepartment,
  type LocationSuggestion,
  rankSuggestions,
  toggleCity,
  toggleDepartment,
} from "./location.js";

const saintEtienne: LocationSuggestion = {
  type: "city",
  name: "Saint-Étienne",
  departmentCode: "42",
  departmentName: "Loire",
};
const empty = { departments: [], cities: [] };

describe("toggleCity", () => {
  it("selects the department of a city with it", () => {
    expect(toggleCity(empty, saintEtienne)).toEqual({
      departments: ["Loire"],
      cities: ["Saint-Étienne"],
    });
  });

  it("keeps the department when the city is removed", () => {
    expect(
      toggleCity({ departments: ["Loire"], cities: ["Saint-Étienne"] }, saintEtienne),
    ).toEqual({ departments: ["Loire"], cities: [] });
  });
});

describe("toggleDepartment", () => {
  it("removes the cities of a department with it", () => {
    const selected = toggleCity({ departments: ["Rhône"], cities: [] }, saintEtienne);

    expect(toggleDepartment({ ...selected, cities: [...selected.cities, "Lyon"] }, "Loire")).toEqual(
      { departments: ["Rhône"], cities: ["Lyon"] },
    );
  });

  it("selects an unselected department", () => {
    expect(toggleDepartment(empty, "Gironde")).toEqual({ departments: ["Gironde"], cities: [] });
  });
});

describe("addDepartment", () => {
  it("does not unselect a department already selected", () => {
    const selection = { departments: ["Gironde"], cities: [] };

    expect(addDepartment(selection, "Gironde")).toBe(selection);
    expect(addDepartment(selection, "Rhône").departments).toEqual(["Gironde", "Rhône"]);
  });
});

describe("rankSuggestions", () => {
  const suggest = (type: "city" | "department", name: string): LocationSuggestion => ({
    type,
    name,
    departmentCode: "00",
    departmentName: name,
  });

  it("puts the exact match first, then the names starting with the search, then the ones containing it", () => {
    const ranked = rankSuggestions(
      [
        suggest("city", "Sainte-Lyon"),
        suggest("city", "Lyonnais"),
        suggest("city", "Lyon"),
      ],
      "lyon",
    );

    expect(ranked.map(({ name }) => name)).toEqual(["Lyon", "Lyonnais", "Sainte-Lyon"]);
  });

  it("ignores accents and case, and puts a department before a city of the same rank", () => {
    const ranked = rankSuggestions(
      [suggest("city", "Rhône-Alpes"), suggest("department", "Rhône")],
      "RHONE",
    );

    expect(ranked[0]?.type).toBe("department");
  });

  it("keeps five suggestions at most", () => {
    const many = Array.from({ length: 8 }, (_, index) => suggest("city", `Ville ${index}`));

    expect(rankSuggestions(many, "ville")).toHaveLength(5);
  });
});
