import type { Document } from "mongodb";
import type { ListWidgetConfig, WidgetConfig } from "../widgetConfig/widgetConfig.schema.js";

// Copied from karfur (apps/client/src/lib/search-helpers.ts) until the search logic is shared
// in a package (RI-1650).

/**
 * Sort stages of the search. `_id` is the last key so that two pages never overlap or skip a
 * content when the other keys are equal.
 */
export const buildSortStages = (sortBy: ListWidgetConfig["sortBy"]): Document[] => {
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

const isDemarche: Document = { $eq: ["$typeContenu", "demarche"] };

const buildThemeStages = (): Document[] => [
  {
    $lookup: { from: "themes", localField: "theme", foreignField: "_id", as: "presentationTheme" },
  },
  { $unwind: { path: "$presentationTheme", preserveNullAndEmptyArrays: true } },
];

const themeImageUrl: Document = {
  $cond: [
    isDemarche,
    "$presentationTheme.demarcheImage.secure_url",
    "$presentationTheme.dispositifImage.secure_url",
  ],
};

const buildSponsorStages = (locale: string): Document[] => [
  {
    $lookup: {
      from: "structures",
      localField: "mainSponsor",
      foreignField: "_id",
      as: "presentationSponsor",
    },
  },
  { $unwind: { path: "$presentationSponsor", preserveNullAndEmptyArrays: true } },
  {
    $addFields: {
      sponsorName: {
        $ifNull: [
          "$presentationSponsor.nom",
          { $cond: [isDemarche, resolveTranslation(locale, "administrationName"), null] },
        ],
      },
      sponsorPictureUrl: {
        $ifNull: [
          "$presentationSponsor.picture.secure_url",
          { $cond: [isDemarche, "$administrationLogo.secure_url", null] },
        ],
      },
    },
  },
];

export const buildPresentationStages = (locale: string, type: WidgetConfig["type"]): Document[] => {
  if (type === "thumbnail") {
    return [
      ...buildThemeStages(),
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          typeContenu: 1,
          titreInformatif: resolveTranslation(locale, "titreInformatif"),
          abstract: resolveTranslation(locale, "abstract"),
          imageUrl: themeImageUrl,
          availableLanguages: {
            $map: {
              input: { $objectToArray: { $ifNull: ["$translations", {}] } },
              as: "translation",
              in: "$$translation.k",
            },
          },
        },
      },
    ];
  }

  return [
    ...buildThemeStages(),
    ...buildSponsorStages(locale),
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        typeContenu: 1,
        titreInformatif: resolveTranslation(locale, "titreInformatif"),
        abstract: resolveTranslation(locale, "abstract"),
        location: "$metadatas.location",
        theme: {
          $cond: [
            { $ifNull: ["$presentationTheme", false] },
            {
              name: {
                $ifNull: [`$presentationTheme.short.${locale}`, "$presentationTheme.short.fr"],
              },
              color: "$presentationTheme.colors.color40",
              imageUrl: themeImageUrl,
            },
            null,
          ],
        },
        secondaryThemeCount: { $size: { $ifNull: ["$secondaryThemes", []] } },
        sponsor: {
          $cond: [
            { $gt: [{ $strLenCP: { $ifNull: ["$sponsorName", ""] } }, 0] },
            { name: "$sponsorName", pictureUrl: "$sponsorPictureUrl" },
            null,
          ],
        },
        price: "$metadatas.price",
        commitment: "$metadatas.commitment",
        lastModificationDate: 1,
      },
    },
  ];
};

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
