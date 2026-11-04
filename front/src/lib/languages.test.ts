import { describe, expect, it } from "vitest";
import { isLanguageAvailable, isRtl, SITE_LANGUAGES } from "./languages.js";

describe("isLanguageAvailable", () => {
  it("always offers French and the languages the content is translated in", () => {
    expect(isLanguageAvailable("fr", ["en"])).toBe(true);
    expect(isLanguageAvailable("en", ["en"])).toBe(true);
    expect(isLanguageAvailable("ru", ["en"])).toBe(false);
  });

  it("does not disable anything while the content is not loaded", () => {
    expect(isLanguageAvailable("ru", undefined)).toBe(true);
  });
});

describe("SITE_LANGUAGES", () => {
  it("starts with French", () => {
    expect(SITE_LANGUAGES[0]?.code).toBe("fr");
  });
});

describe("isRtl", () => {
  it("detects right-to-left languages", () => {
    expect(isRtl("ar")).toBe(true);
    expect(isRtl("en")).toBe(false);
  });
});
