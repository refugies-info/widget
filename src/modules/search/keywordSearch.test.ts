import type { SearchClient } from "@algolia/client-search";
import { describe, expect, it } from "vitest";
import { createKeywordSearch } from "./keywordSearch.js";

describe("createKeywordSearch", () => {
  it("asks Algolia for the ids only and returns them in the order of the hits", async () => {
    const requests: unknown[] = [];
    const client = {
      searchSingleIndex: async (request: unknown) => {
        requests.push(request);
        return { hits: [{ objectID: "b" }, { objectID: "a" }] };
      },
    } as unknown as SearchClient;
    const keywordSearch = createKeywordSearch(
      { ALGOLIA_APP_ID: "app", ALGOLIA_SEARCH_API_KEY: "key", ALGOLIA_INDEX_NAME: "index" },
      client,
    );

    expect(await keywordSearch.findMatchedDispositifsIds("logement")).toEqual(["b", "a"]);
    expect(requests).toEqual([
      {
        indexName: "index",
        searchParams: { query: "logement", attributesToRetrieve: ["objectID"], hitsPerPage: 1000 },
      },
    ]);
  });
});
