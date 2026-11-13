import { describe, expect, it } from "vitest";
import { buildPageItems } from "./pagination.js";

describe("buildPageItems", () => {
  it("shows every page when there are few", () => {
    expect(buildPageItems(1, 3)).toEqual([1, 2, 3]);
    expect(buildPageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses the distant pages", () => {
    expect(buildPageItems(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(buildPageItems(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(buildPageItems(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });

  it("does not replace a single missing page with an ellipsis", () => {
    expect(buildPageItems(4, 8)).toEqual([1, 2, 3, 4, 5, "ellipsis", 8]);
  });

  it("has one page, or none", () => {
    expect(buildPageItems(1, 1)).toEqual([1]);
    expect(buildPageItems(1, 0)).toEqual([]);
  });
});
