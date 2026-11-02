import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { type AppDependencies, buildApp } from "./app.js";
import type {
  DispositifRepository,
  FindDisplayedPageOptions,
} from "./modules/dispositif/dispositif.repository.js";
import type { WidgetConfig } from "./modules/widgetConfig/widgetConfig.schema.js";

const activeConfig: WidgetConfig = {
  publicId: "3f1c7a52-9b4e-4d6a-8c21-5e0a7b9d4f13",
  status: "active",
  type: "list",
  authorizedDomains: ["exemple.org"],
  externalTitle: "Les fiches de Bordeaux",
  description: "Toutes les fiches utiles à Bordeaux.",
  displayDescription: true,
  filters: {},
  selectedDispositifIds: [],
  excludedDispositifIds: [],
  pageSize: 8,
  sortBy: "date",
  displayShareModule: true,
  displayFilterBar: true,
  filterBarOptions: ["keyword", "location"],
};

const emptyPage = { items: [], total: 0, page: 1, pageCount: 0 };

const buildTestApp = (overrides: Partial<AppDependencies> = {}) =>
  buildApp(
    { LOG_LEVEL: "silent" },
    {
      database: { ping: async () => true },
      widgetConfigRepository: {
        findByPublicId: async (publicId) =>
          publicId === activeConfig.publicId ? activeConfig : null,
      },
      dispositifRepository: { findDisplayedPage: async () => emptyPage },
      keywordSearch: { findMatchedDispositifsIds: async () => [] },
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
      authorizedDomains: ["exemple.org"],
    });
    expect(response.json()).not.toHaveProperty("internalTitle");
  });

  it("returns only the title and the domains of a thumbnail widget", async () => {
    const thumbnailConfig: WidgetConfig = {
      publicId: "9a4d2c11-5b7e-4f3a-b8d0-1c6e2f9a7b34",
      status: "active",
      type: "thumbnail",
      authorizedDomains: ["exemple.org"],
      externalTitle: "Demander un titre de voyage",
      dispositifId: new ObjectId("6710f2a1c3d4e5f607182931"),
    };
    const app = buildTestApp({
      widgetConfigRepository: { findByPublicId: async () => thumbnailConfig },
    });
    const response = await app.inject({
      method: "GET",
      url: `/widgets/${thumbnailConfig.publicId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      publicId: thumbnailConfig.publicId,
      type: "thumbnail",
      authorizedDomains: ["exemple.org"],
      externalTitle: "Demander un titre de voyage",
    });
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

describe("GET /widgets/:publicId/dispositifs", () => {
  const url = `/widgets/${activeConfig.publicId}/dispositifs`;

  it("passes the page and the locale to the repository", async () => {
    const calls: unknown[] = [];
    const dispositifRepository: DispositifRepository = {
      findDisplayedPage: async (config, options) => {
        calls.push({ publicId: config.publicId, ...options });
        return emptyPage;
      },
    };
    const response = await buildTestApp({ dispositifRepository }).inject({
      method: "GET",
      url: `${url}?page=2&locale=en`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(emptyPage);
    expect(calls).toEqual([
      { publicId: activeConfig.publicId, page: 2, locale: "en", filters: {} },
    ]);
  });

  it("defaults to the first page in French", async () => {
    const calls: unknown[] = [];
    const dispositifRepository: DispositifRepository = {
      findDisplayedPage: async (_config, options) => {
        calls.push(options);
        return emptyPage;
      },
    };
    await buildTestApp({ dispositifRepository }).inject({ method: "GET", url });

    expect(calls).toEqual([{ page: 1, locale: "fr", filters: {} }]);
  });

  it.each(["page=0", "page=abc", "page=100000", "locale=fr.content", "locale=$where"])(
    "rejects the query %s",
    async (query) => {
      const response = await buildTestApp().inject({ method: "GET", url: `${url}?${query}` });
      expect(response.statusCode).toBe(400);
    },
  );

  describe("visitor filters and keyword", () => {
    const themeId = "64b7f0c2a1d3e4f5a6b7c8d9";
    const searchedKeywords: string[] = [];
    const recordCalls = () => {
      const calls: FindDisplayedPageOptions[] = [];
      const dispositifRepository: DispositifRepository = {
        findDisplayedPage: async (_config, options) => {
          calls.push(options);
          return emptyPage;
        },
      };
      return { calls, dispositifRepository };
    };
    const appFor = (config: WidgetConfig, dispositifRepository: DispositifRepository) =>
      buildTestApp({
        widgetConfigRepository: { findByPublicId: async () => config },
        dispositifRepository,
        keywordSearch: {
          findMatchedDispositifsIds: async (keyword) => {
            searchedKeywords.push(keyword);
            return ["b", "a"];
          },
        },
      });

    it("passes the filters allowed by the filter bar, and the ids found for the keyword", async () => {
      const { calls, dispositifRepository } = recordCalls();
      const config = {
        ...activeConfig,
        filterBarOptions: ["keyword", "location", "theme", "age"],
      } satisfies WidgetConfig;
      searchedKeywords.length = 0;

      const response = await appFor(config, dispositifRepository).inject({
        method: "GET",
        url: `${url}?search=%20logement%20&departments=Gironde&departments=Paris&themes=${themeId}&ages=-18`,
      });

      expect(response.statusCode).toBe(200);
      expect(searchedKeywords).toEqual(["logement"]);
      expect(calls[0]?.matchedDispositifsIds).toEqual(["b", "a"]);
      expect(calls[0]?.filters).toEqual({
        departments: ["Gironde", "Paris"],
        themes: [new ObjectId(themeId)],
        ages: ["-18"],
      });
    });

    it("ignores the parameters of an option that is not in the filter bar", async () => {
      const { calls, dispositifRepository } = recordCalls();
      searchedKeywords.length = 0;

      await appFor(
        { ...activeConfig, filterBarOptions: ["location"] },
        dispositifRepository,
      ).inject({ method: "GET", url: `${url}?search=logement&departments=Gironde&publics=women` });

      expect(searchedKeywords).toEqual([]);
      expect(calls[0]?.matchedDispositifsIds).toBeUndefined();
      expect(calls[0]?.filters).toEqual({ departments: ["Gironde"] });
    });

    it("ignores every parameter when the filter bar is hidden", async () => {
      const { calls, dispositifRepository } = recordCalls();
      searchedKeywords.length = 0;

      await appFor({ ...activeConfig, displayFilterBar: false }, dispositifRepository).inject({
        method: "GET",
        url: `${url}?search=logement&departments=Gironde`,
      });

      expect(searchedKeywords).toEqual([]);
      expect(calls[0]?.filters).toEqual({});
    });

    it("ignores every parameter for a thumbnail widget", async () => {
      const { calls, dispositifRepository } = recordCalls();
      const thumbnail: WidgetConfig = {
        publicId: activeConfig.publicId,
        status: "active",
        type: "thumbnail",
        authorizedDomains: [],
        externalTitle: "Une fiche",
        dispositifId: new ObjectId(),
      };
      searchedKeywords.length = 0;

      await appFor(thumbnail, dispositifRepository).inject({
        method: "GET",
        url: `${url}?search=logement&departments=Gironde`,
      });

      expect(searchedKeywords).toEqual([]);
      expect(calls[0]?.filters).toEqual({});
    });

    it.each([
      "publics=martian",
      "statuses=unknown",
      "frenchLevels=z",
      "ages=30",
      "themes=not-an-id",
      "languages=fr.content",
      "departments=",
      `search=${"a".repeat(101)}`,
      `departments=${"a".repeat(101)}`,
      `languages=${Array.from({ length: 31 }, () => "ar").join("&languages=")}`,
    ])("rejects the query %s", async (query) => {
      const response = await buildTestApp().inject({ method: "GET", url: `${url}?${query}` });
      expect(response.statusCode).toBe(400);
    });
  });

  it("answers the same 404 for an unknown, an inactive and a malformed widget", async () => {
    const inactive = { ...activeConfig, status: "inactive" as const };
    const app = buildTestApp({
      widgetConfigRepository: {
        findByPublicId: async (publicId) => (publicId === inactive.publicId ? inactive : null),
      },
    });
    const urls = [
      url,
      "/widgets/00000000-0000-4000-8000-000000000000/dispositifs",
      "/widgets/not-a-uuid/dispositifs",
    ];
    const responses = await Promise.all(
      urls.map((target) => app.inject({ method: "GET", url: target })),
    );

    for (const response of responses) {
      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Not Found" });
    }
  });
});
