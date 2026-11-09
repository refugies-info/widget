import { describe, expect, it } from "vitest";
import { translate, translateCount, translateExact } from "./wording.js";

describe("translate", () => {
  it("translates a wording in the language of the visitor", () => {
    expect(translate("en", "translateLabel")).toBe("Translate:");
  });

  it("shows the French wording while a language has no translation for it", () => {
    expect(translate("ar", "emptyTitle")).toBe("Le widget est vide.");
  });

  it("shows the French wording while the translation of a language is an empty string", () => {
    expect(translate("ar", "sourceLong")).toBe(translate("fr", "sourceLong"));
  });

  it("falls back on French for a language the widget does not know", () => {
    expect(translate("de", "translateLabel")).toBe("Traduire :");
  });

  it("fills the placeholders", () => {
    expect(translate("fr", "pageLabel", { page: 3 })).toBe("Page 3");
  });
});

describe("translateExact", () => {
  it("does not fall back on French", () => {
    expect(translateExact("ar", "cardUpdated")).toBeUndefined();
    expect(translateExact("fr", "cardUpdated")).toBe("Mise à jour");
  });
});

describe("translateCount", () => {
  it("picks the singular and the plural", () => {
    expect(translateCount("fr", "resultsCount", 1)).toBe("1 résultat");
    expect(translateCount("fr", "resultsCount", 43)).toBe("43 résultats");
    expect(translateCount("en", "resultsCount", 2)).toBe("2 results");
  });

  it("counts zero as a plural in English and as a singular in French", () => {
    expect(translateCount("en", "resultsCount", 0)).toBe("0 results");
    expect(translateCount("fr", "resultsCount", 0)).toBe("0 résultat");
  });

  it("falls back on French for a language without this wording", () => {
    expect(translateCount("ti", "resultsCount", 5)).toBe("5 résultats");
  });
});
