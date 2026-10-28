import type { Collection, Db, ObjectId } from "mongodb";
import type {
  ListWidgetConfig,
  ThumbnailWidgetConfig,
  WidgetConfig,
} from "../widgetConfig/widgetConfig.schema.js";
import { buildDispositifMatch } from "./dispositif.match.js";
import { buildPresentationStages, buildSortStages, planPage } from "./dispositif.pipeline.js";
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

const unique = (ids: ObjectId[]): ObjectId[] => [
  ...new Map(ids.map((id) => [id.toHexString(), id])).values(),
];

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
  const selectedIds = unique(config.selectedDispositifIds);
  const filteredMatch = {
    $and: [
      buildDispositifMatch(config.filters),
      { _id: { $nin: [...config.excludedDispositifIds, ...selectedIds] } },
    ],
  };
  const presentation = buildPresentationStages(locale, "list");

  const [publishedSelectedDocs, filteredCount] = await Promise.all([
    collection
      .aggregate([
        {
          $match: {
            _id: { $in: selectedIds, $nin: config.excludedDispositifIds },
            status: "Actif",
          },
        },
        ...presentation,
      ])
      .toArray(),
    collection.countDocuments(filteredMatch),
  ]);
  const total = publishedSelectedDocs.length + filteredCount;

  const selectedOrder = new Map(selectedIds.map((id, index) => [id.toHexString(), index]));
  const publishedSelected = publishedSelectedDocs
    .map((doc) => displayedCardSchema.parse(doc))
    .sort((a, b) => (selectedOrder.get(a.id) ?? 0) - (selectedOrder.get(b.id) ?? 0));

  const plan = planPage({
    selectedCount: publishedSelected.length,
    page,
    pageSize: config.pageSize,
  });
  const orderedSelected = publishedSelected.slice(plan.selectedStart, plan.selectedEnd);
  const filteredDocs =
    plan.filteredLimit > 0 && filteredCount > plan.filteredSkip
      ? await collection
          .aggregate([
            { $match: filteredMatch },
            ...buildSortStages(config.sortBy),
            { $skip: plan.filteredSkip },
            { $limit: plan.filteredLimit },
            ...presentation,
          ])
          .toArray()
      : [];

  return {
    items: [...orderedSelected, ...filteredDocs.map((doc) => displayedCardSchema.parse(doc))],
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
