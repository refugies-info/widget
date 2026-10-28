import type { Document } from "mongodb";
import type { WidgetConfig } from "../widgetConfig/widgetConfig.schema.js";

// Copied from karfur (apps/client/src/lib/search-helpers.ts) until the search logic is shared
// in a package (RI-1650).

/**
 * Sort stages of the search. `_id` is the last key so that two pages never overlap or skip a
 * content when the other keys are equal.
 */
export const buildSortStages = (sortBy: WidgetConfig["sortBy"]): Document[] => {
  switch (sortBy) {
    case "theme":
      return [
        { $lookup: { from: "themes", localField: "theme", foreignField: "_id", as: "themeDoc" } },
        { $unwind: { path: "$themeDoc", preserveNullAndEmptyArrays: true } },
        { $addFields: { themeSortIndex: { $ifNull: ["$themeDoc.position", 999] } } },
        { $sort: { themeSortIndex: 1, publishedAt: -1, _id: 1 } },
      ];
    case "location":
      return [
        {
          $addFields: {
            isLocal: {
              $cond: { if: { $eq: ["$metadatas.location", "france"] }, then: 2, else: 1 },
            },
          },
        },
        { $sort: { isLocal: 1, "metadatas.vues": -1, _id: 1 } },
      ];
    case "views":
      return [{ $sort: { nbVues: -1, _id: 1 } }];
    case "date":
      return [{ $sort: { publishedAt: -1, _id: 1 } }];
  }
};

const resolveTranslation = (locale: string, field: string): Document => ({
  $ifNull: [`$translations.${locale}.content.${field}`, `$translations.fr.content.${field}`],
});

/**
 * Keeps only what a widget displays. `locale` ends up in a field path: it must be validated by
 * the caller.
 */
export const buildPresentationStages = (locale: string): Document[] => [
  {
    $project: {
      _id: 0,
      id: { $toString: "$_id" },
      typeContenu: 1,
      publishedAt: 1,
      titreInformatif: resolveTranslation(locale, "titreInformatif"),
      titreMarque: resolveTranslation(locale, "titreMarque"),
      abstract: resolveTranslation(locale, "abstract"),
    },
  },
];

export interface PagePlan {
  selectedStart: number;
  selectedEnd: number;
  filteredSkip: number;
  filteredLimit: number;
}

/**
 * The selected contents come first, then the filtered ones: both form a single paginated list.
 */
export const planPage = ({
  selectedCount,
  page,
  pageSize,
}: {
  selectedCount: number;
  page: number;
  pageSize: number;
}): PagePlan => {
  const offset = (page - 1) * pageSize;
  const selectedStart = Math.min(offset, selectedCount);
  const selectedEnd = Math.min(offset + pageSize, selectedCount);
  return {
    selectedStart,
    selectedEnd,
    filteredSkip: Math.max(0, offset - selectedCount),
    filteredLimit: pageSize - (selectedEnd - selectedStart),
  };
};
