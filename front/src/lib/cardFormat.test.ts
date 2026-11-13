import { describe, expect, it } from "vitest";
import { buildBadge, formatCommitment, formatPrice, formatUpdate } from "./cardFormat.js";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-09T12:00:00Z").getTime();
const ago = (days: number) => new Date(now - days * DAY).toISOString();
// The formats use non-breaking spaces
const plain = (text: string | null) => text?.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("says it is free", () => {
    expect(formatPrice({ values: [0] }, "fr")).toBe("Gratuit");
    expect(formatPrice({ values: [0] }, "en")).toBe("Free of charge");
  });

  it("formats an amount and a range in euros", () => {
    expect(plain(formatPrice({ values: [10] }, "fr"))).toMatch(/^10(,00)? €$/);
    expect(formatPrice({ values: [10, 20] }, "fr")).toContain("20");
  });

  it("shows nothing without a price", () => {
    expect(formatPrice(null, "fr")).toBeNull();
    expect(formatPrice({ values: [] }, "fr")).toBeNull();
  });
});

describe("formatCommitment", () => {
  it("formats a duration in the language of the visitor", () => {
    expect(plain(formatCommitment({ amountDetails: "exactly", hours: [10], timeUnit: "months" }, "fr"))).toBe("10 mois");
    expect(plain(formatCommitment({ amountDetails: "exactly", hours: [2], timeUnit: "hours" }, "fr"))).toBe("2 heures");
    expect(plain(formatCommitment({ amountDetails: "exactly", hours: [10], timeUnit: "months" }, "en"))).toBe("10 months");
  });

  it("turns the trimesters and the semesters into months", () => {
    expect(plain(formatCommitment({ amountDetails: "exactly", hours: [2], timeUnit: "trimesters" }, "fr"))).toBe("6 mois");
    expect(plain(formatCommitment({ amountDetails: "exactly", hours: [1], timeUnit: "semesters" }, "fr"))).toBe("6 mois");
  });

  it("words the sessions and the half-days", () => {
    expect(plain(formatCommitment({ amountDetails: "exactly", hours: [1], timeUnit: "sessions" }, "fr"))).toBe("1 séance");
    expect(plain(formatCommitment({ amountDetails: "exactly", hours: [3], timeUnit: "half-days" }, "fr"))).toBe("3 demi-journées");
  });

  it("formats a range", () => {
    expect(formatCommitment({ amountDetails: "between", hours: [2, 4], timeUnit: "hours" }, "fr")).toContain("4");
  });

  it("shows nothing for an unknown unit or without hours", () => {
    expect(formatCommitment({ amountDetails: "exactly", hours: [2], timeUnit: "decades" }, "fr")).toBeNull();
    expect(formatCommitment({ amountDetails: "exactly", hours: [], timeUnit: "hours" }, "fr")).toBeNull();
    expect(formatCommitment(null, "fr")).toBeNull();
  });
});

describe("formatUpdate", () => {
  it("shows the days, then the months", () => {
    expect(plain(formatUpdate(ago(6), "fr", now))).toBe("Mise à jour il y a 6 jours");
    expect(plain(formatUpdate(ago(45), "fr", now))).toBe("Mise à jour il y a 1 mois");
    expect(plain(formatUpdate(ago(90), "fr", now))).toBe("Mise à jour il y a 3 mois");
  });

  it("says when it is more than a year old", () => {
    expect(plain(formatUpdate(ago(400), "fr", now))).toBe("Mise à jour il y a plus d’un an");
  });

  it("only shows the relative time in a language whose prefix reads badly", () => {
    expect(formatUpdate(ago(6), "ar", now)).not.toContain("Mise à jour");
  });
});

describe("buildBadge", () => {
  it("labels a procedure", () => {
    expect(buildBadge({ typeContenu: "demarche", location: null }, "fr")).toEqual({
      text: "Démarche",
      kind: "procedure",
    });
  });

  it("shows the department of a content as the site does", () => {
    expect(buildBadge({ typeContenu: "dispositif", location: ["75 - Paris"] }, "fr")?.text).toBe("Paris 75");
  });

  it("counts several departments, and names the whole country and the web", () => {
    expect(buildBadge({ typeContenu: "dispositif", location: ["75 - Paris", "33 - Gironde"] }, "fr")?.text).toBe(
      "2 départements",
    );
    expect(buildBadge({ typeContenu: "dispositif", location: "france" }, "fr")?.text).toBe("Toute la France");
    expect(buildBadge({ typeContenu: "dispositif", location: "online" }, "fr")?.text).toBe("En ligne");
  });

  it("has no badge without a place", () => {
    expect(buildBadge({ typeContenu: "dispositif", location: null }, "fr")).toBeNull();
    expect(buildBadge({ typeContenu: "dispositif", location: [] }, "fr")).toBeNull();
  });
});
