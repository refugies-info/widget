import type { Collection, Db } from "mongodb";
import type {
  ListWidgetConfig,
  ThumbnailWidgetConfig,
  WidgetConfig,
} from "../widgetConfig/widgetConfig.schema.js";
import { buildListWidgetMatch } from "./dispositif.match.js";
import { buildPresentationStages, buildSortStages } from "./dispositif.pipeline.js";
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

export interface DispositifRepository {
  findDisplayedPage: (
    config: WidgetConfig,
    options: { page: number; locale: string },
  ) => Promise<ListDispositifsPage>;
}

const findThumbnail = async (
  collection: Collection,
  config: ThumbnailWidgetConfig,
  locale: string,
): Promise<ListDispositifsPage> => {
  const docs = await collection
    .aggregate([
      { $match: { _id: config.dispositifId, status: "Actif" } },
      ...buildPresentationStages(locale, "thumbnail"),
    ])
    .toArray();
  const items = docs.map((doc) => displayedThumbnailSchema.parse(doc));

  return { items, total: items.length, page: 1, pageCount: items.length };
};

const findList = async (
  collection: Collection,
  config: ListWidgetConfig,
  { page, locale }: { page: number; locale: string },
): Promise<ListDispositifsPage> => {
  const match = buildListWidgetMatch(config);

  const [docs, total] = await Promise.all([
    collection
      .aggregate([
        { $match: match },
        ...buildSortStages(config.sortBy),
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
