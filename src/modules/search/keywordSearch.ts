import { type SearchClient, searchClient } from "@algolia/client-search";
import type { Config } from "../../config.js";

// Same approach as karfur (apps/client/src/lib/search-helpers.ts, resolveAlgoliaIds): Algolia ranks
// the contents, MongoDB filters them. Algolia answers with at most 1000 hits before the filters.
const MAX_HITS = 1000;

export interface KeywordSearch {
  /** Ids of the contents matching the keyword, most relevant first. */
  findMatchedDispositifsIds: (keyword: string) => Promise<string[]>;
}

export const createKeywordSearch = (
  config: Pick<Config, "ALGOLIA_APP_ID" | "ALGOLIA_SEARCH_API_KEY" | "ALGOLIA_INDEX_NAME">,
  client: SearchClient = searchClient(config.ALGOLIA_APP_ID, config.ALGOLIA_SEARCH_API_KEY),
): KeywordSearch => ({
  findMatchedDispositifsIds: async (keyword) => {
    const { hits } = await client.searchSingleIndex<{ objectID: string }>({
      indexName: config.ALGOLIA_INDEX_NAME,
      searchParams: { query: keyword, attributesToRetrieve: ["objectID"], hitsPerPage: MAX_HITS },
    });
    return hits.map((hit) => hit.objectID);
  },
});
