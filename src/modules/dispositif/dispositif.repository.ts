import { type Collection, type Db, ObjectId } from "mongodb";
import type {
  ListWidgetConfig,
  ThumbnailWidgetConfig,
  WidgetConfig,
  WidgetConfigFilters,
} from "../widgetConfig/widgetConfig.schema.js";
import { buildListWidgetMatch } from "./dispositif.match.js";
import {
  buildKeywordRankStages,
  buildPresentationStages,
  buildSortStages,
} from "./dispositif.pipeline.js";
import {
  type DisplayedDispositif,
  displayedCardSchema,
  displayedThumbnailSchema,
} from "./dispositif.schema.js";

export interface ListDispositifsPage {
  items: DisplayedDispositif[];
  total: number;
  page: number;
  pageCount: number;
}

export interface FindDisplayedPageOptions {
  page: number;
  locale: string;
  filters?: WidgetConfigFilters;
  matchedDispositifsIds?: string[];
}

export interface DispositifRepository {
  findDisplayedPage: (
    config: WidgetConfig,
    options: FindDisplayedPageOptions,
  ) => Promise<ListDispositifsPage>;
}

const findThumbnail = async (
  collection: Collection,
  config: ThumbnailWidgetConfig,
  locale: string,
): Promise<ListDispositifsPage> => {
  const docs = await collection
    .aggregate([
      { $match: { _id: config.thumbnailDispositifId, status: "Actif" } },
      ...buildPresentationStages(locale, "thumbnail"),
    ])
    .toArray();
  const items = docs.map((doc) => displayedThumbnailSchema.parse(doc));

  return { items, total: items.length, page: 1, pageCount: items.length };
};

const findList = async (
  collection: Collection,
  config: ListWidgetConfig,
  { page, locale, filters, matchedDispositifsIds }: FindDisplayedPageOptions,
): Promise<ListDispositifsPage> => {
  if (matchedDispositifsIds?.length === 0) return { items: [], total: 0, page, pageCount: 0 };

  const match = buildListWidgetMatch(config, {
    filters,
    matchedDispositifsIds: matchedDispositifsIds
      ?.filter(ObjectId.isValid)
      .map((id) => new ObjectId(id)),
  });

  const [docs, total] = await Promise.all([
    collection
      .aggregate([
        { $match: match },
        ...(matchedDispositifsIds
          ? buildKeywordRankStages(matchedDispositifsIds)
          : buildSortStages(config.sortBy)),
        { $skip: (page - 1) * config.pageSize },
        { $limit: config.pageSize },
        ...buildPresentationStages(locale, "list"),
      ])
      .toArray(),
    collection.countDocuments(match),
  ]);

  return {
    items: docs.map((doc) => displayedCardSchema.parse(doc)),
    total,
    page,
    pageCount: Math.ceil(total / config.pageSize),
  };
};

export const createDispositifRepository = (db: Db): DispositifRepository => ({
  findDisplayedPage: async (config, options) => {
    const collection = db.collection("dispositifs");

    return config.type === "thumbnail"
      ? findThumbnail(collection, config, options.locale)
      : findList(collection, config, options);
  },
});
