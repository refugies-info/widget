import { describe, expect, it } from "vitest";
import { measureHeight } from "./hostPage.js";

const box = (top: number, bottom: number) => ({ top, bottom, height: bottom - top });

describe("measureHeight", () => {
  it("is the height of the content, rounded up", () => {
    expect(measureHeight(box(0, 420.2), [])).toBe(421);
  });

  it("includes a menu that goes below the content, with its shadow", () => {
    expect(measureHeight(box(0, 300), [box(100, 340)])).toBe(348);
  });

  it("ignores a menu that stays inside the content", () => {
    expect(measureHeight(box(0, 900), [box(100, 340)])).toBe(900);
  });

  it("ignores a hidden menu", () => {
    expect(measureHeight(box(-500, -200), [box(0, 0)])).toBe(300);
  });
});
