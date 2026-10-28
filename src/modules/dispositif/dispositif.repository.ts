import type { Db, ObjectId } from "mongodb";
import { z } from "zod";
import type { WidgetConfig } from "../widgetConfig/widgetConfig.schema.js";
import { buildDispositifMatch } from "./dispositif.match.js";
import { buildPresentationStages, buildSortStages, planPage } from "./dispositif.pipeline.js";

const displayedDispositifSchema = z.object({
  id: z.string(),
  typeContenu: z.enum(["dispositif", "demarche"]),
  titreInformatif: z.string().nullish(),
  titreMarque: z.string().nullish(),
  abstract: z.string().nullish(),
  publishedAt: z.date().nullish(),
});

export type DisplayedDispositif = z.infer<typeof displayedDispositifSchema>;

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

export const createDispositifRepository = (db: Db): DispositifRepository => ({
  findDisplayedPage: async (config, { page, locale }) => {
    const collection = db.collection("dispositifs");

    const selectedIds = unique(config.selectedDispositifIds);
    const filteredMatch = {
      $and: [
        buildDispositifMatch(config.filters),
        { _id: { $nin: [...config.excludedDispositifIds, ...selectedIds] } },
      ],
    };
    const presentation = buildPresentationStages(locale);

    // Mongo drops the selected contents that are excluded or not published anymore
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
      .map((doc) => displayedDispositifSchema.parse(doc))
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
      items: [
        ...orderedSelected,
        ...filteredDocs.map((doc) => displayedDispositifSchema.parse(doc)),
      ],
      total,
      page,
      pageCount: Math.ceil(total / config.pageSize),
    };
  },
});
