import { describe, expect, it } from "vitest";
import { translate } from "./wording.js";

describe("translate", () => {
  it("translates a wording in the language of the visitor", () => {
    expect(translate("en", "translateLabel")).toBe("Translate:");
  });

  it("shows the French wording while a language has no translation for it", () => {
    expect(translate("ar", "emptyTitle")).toBe("Le widget est vide.");
  });

  it("uses the translation of the tagline of the site where there is one", () => {
    expect(translate("ar", "sourceLong")).toContain("معلومات للاجئين في فرنسا");
  });

  it("falls back on French for a language the widget does not know", () => {
    expect(translate("de", "translateLabel")).toBe("Traduire :");
  });
});
