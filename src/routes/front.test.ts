import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import type { WidgetConfig } from "../modules/widgetConfig/widgetConfig.schema.js";
import { buildFrameAncestors } from "./front.js";

const publicId = "3f1c7a52-9b4e-4d6a-8c21-5e0a7b9d4f13";

const thumbnailConfig: WidgetConfig = {
  publicId,
  status: "active",
  type: "thumbnail",
  authorizedDomains: ["exemple.org", "*.partenaire.fr"],
  externalTitle: "Une vignette",
  thumbnailDispositifId: "64b7f0c2a1d3e4f5a6b7c8d9" as never,
};

const frontDirectory = mkdtempSync(join(tmpdir(), "widget-front-"));
writeFileSync(join(frontDirectory, "index.html"), "<!doctype html><div id=app></div>");

const buildFrontApp = (config: WidgetConfig | null = thumbnailConfig) =>
  buildApp(
    { LOG_LEVEL: "silent", frontDirectory },
    {
      database: { ping: async () => true },
      widgetConfigRepository: { findByPublicId: async (id) => (id === publicId ? config : null) },
      dispositifRepository: {
        findDisplayedPage: async () => ({ items: [], total: 0, page: 1, pageCount: 0 }),
      },
      keywordSearch: { findMatchedDispositifsIds: async () => [] },
      filterOptionsRepository: { findThemes: async () => [], findLanguages: async () => [] },
    },
  );

describe("GET /w/:publicId", () => {
  it("serves the page of the iframe and only lets the authorized domains embed it", async () => {
    const response = await buildFrontApp().inject({ method: "GET", url: `/w/${publicId}` });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("id=app");
    expect(response.headers["content-security-policy"]).toBe(
      "frame-ancestors https://exemple.org https://*.partenaire.fr",
    );
  });

  it("answers the same 404 for an unknown, an inactive and a malformed widget", async () => {
    const inactive = { ...thumbnailConfig, status: "inactive" as const };
    const responses = await Promise.all([
      buildFrontApp().inject({ method: "GET", url: "/w/00000000-0000-4000-8000-000000000000" }),
      buildFrontApp(inactive).inject({ method: "GET", url: `/w/${publicId}` }),
      buildFrontApp().inject({ method: "GET", url: "/w/not-a-uuid" }),
    ]);

    for (const response of responses) {
      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Not Found" });
    }
  });
});

describe("buildFrameAncestors", () => {
  it("forbids every site when no domain is authorized", () => {
    expect(buildFrameAncestors([])).toBe("frame-ancestors 'none'");
  });

  it("drops the values that are not a hostname", () => {
    expect(buildFrameAncestors(["exemple.org", "a.org; script-src *", "https://b.org", ""])).toBe(
      "frame-ancestors https://exemple.org",
    );
  });
});
