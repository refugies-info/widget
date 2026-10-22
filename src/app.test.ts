import { describe, expect, it } from "vitest";
import { type AppDependencies, buildApp } from "./app.js";
import type { WidgetConfig } from "./modules/widgetConfig/widgetConfig.schema.js";

const activeConfig: WidgetConfig = {
  publicId: "3f1c7a52-9b4e-4d6a-8c21-5e0a7b9d4f13",
  status: "active",
  type: "list",
  authorizedDomains: ["exemple.org"],
  externalTitle: "Les fiches de Bordeaux",
  description: "Toutes les fiches utiles à Bordeaux.",
  displayDescription: true,
  pageSize: 8,
  sortBy: "date",
  displayShareModule: true,
  displayFilterBar: true,
  filterBarOptions: ["keyword", "location"],
};

const buildTestApp = (overrides: Partial<AppDependencies> = {}) =>
  buildApp(
    { LOG_LEVEL: "silent" },
    {
      database: { ping: async () => true },
      widgetConfigRepository: {
        findByPublicId: async (publicId) =>
          publicId === activeConfig.publicId ? activeConfig : null,
      },
      ...overrides,
    },
  );

describe("GET /health", () => {
  it("returns 200 when the database answers", async () => {
    const response = await buildTestApp().inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("returns 503 when the database is down", async () => {
    const app = buildTestApp({ database: { ping: async () => false } });
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(503);
  });
});

describe("GET /widgets/:publicId", () => {
  it("returns the public config of an active widget", async () => {
    const response = await buildTestApp().inject({
      method: "GET",
      url: `/widgets/${activeConfig.publicId}`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      publicId: activeConfig.publicId,
      externalTitle: "Les fiches de Bordeaux",
    });
    expect(response.json()).not.toHaveProperty("internalTitle");
    expect(response.json()).not.toHaveProperty("authorizedDomains");
  });

  it("answers the same 404 for an unknown, an inactive and a malformed id", async () => {
    const inactive = {
      ...activeConfig,
      publicId: "7d2e9b84-1a3c-4f5e-9d60-2b8c4a1e6f07",
      status: "inactive" as const,
    };
    const app = buildTestApp({
      widgetConfigRepository: {
        findByPublicId: async (publicId) => (publicId === inactive.publicId ? inactive : null),
      },
    });
    const urls = [
      `/widgets/${inactive.publicId}`,
      "/widgets/00000000-0000-4000-8000-000000000000",
      "/widgets/not-a-uuid",
    ];
    const responses = await Promise.all(urls.map((url) => app.inject({ method: "GET", url })));

    for (const response of responses) {
      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Not Found" });
    }
  });
});
