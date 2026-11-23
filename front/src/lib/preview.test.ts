import { describe, expect, it } from "vitest";
import { isPreview } from "./preview.js";

describe("isPreview", () => {
  it("is true only for preview=1", () => {
    expect(isPreview("?preview=1&v=2")).toBe(true);
    expect(isPreview("?preview=0")).toBe(false);
    expect(isPreview("?locale=fr")).toBe(false);
    expect(isPreview("")).toBe(false);
  });
});
