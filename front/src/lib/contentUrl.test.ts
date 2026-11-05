import { describe, expect, it } from "vitest";
import { buildContentUrl } from "./contentUrl.js";

const id = "6ae0836bc761b5b88786311e";
const siteUrl = "https://refugies.info";

describe("buildContentUrl", () => {
  it("links to the content in French without prefix", () => {
    expect(buildContentUrl(siteUrl, { id, typeContenu: "dispositif" }, "fr")).toBe(
      `https://refugies.info/dispositif/${id}`,
    );
    expect(buildContentUrl(siteUrl, { id, typeContenu: "demarche" }, "fr")).toBe(
      `https://refugies.info/demarche/${id}`,
    );
  });

  it("prefixes the locale and uses the translated path in the other languages", () => {
    expect(buildContentUrl(siteUrl, { id, typeContenu: "dispositif" }, "ar")).toBe(
      `https://refugies.info/ar/program/${id}`,
    );
    expect(buildContentUrl(siteUrl, { id, typeContenu: "demarche" }, "en")).toBe(
      `https://refugies.info/en/procedure/${id}`,
    );
  });

  it("points to the site of the environment", () => {
    expect(buildContentUrl("https://staging.refugies.info", { id, typeContenu: "dispositif" }, "en")).toBe(
      `https://staging.refugies.info/en/program/${id}`,
    );
  });
});
