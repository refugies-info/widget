import type { Document } from "mongodb";
import type { ListWidgetConfig, WidgetConfigFilters } from "../widgetConfig/widgetConfig.schema.js";

// Copied from karfur (apps/client/src/lib/search-helpers.ts, buildBaseMatch) until the search
// filters are shared in a package (RI-1650). Keep the semantics identical.

const frenchLevelValuesByOption = {
  alpha: ["alpha"],
  a: ["A1", "A2"],
  b: ["B1", "B2"],
  c: ["C1", "C2"],
} as const;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const convertAge = (index: 0 | 1, onMissing: number) => ({
  $convert: {
    input: { $arrayElemAt: ["$metadatas.age.ages", index] },
    to: "int",
    onError: onMissing,
    onNull: onMissing,
  },
});

const minAgeExpression = {
  $switch: {
    branches: [
      { case: { $eq: ["$metadatas.age.type", "between"] }, then: convertAge(0, 0) },
      { case: { $eq: ["$metadatas.age.type", "moreThan"] }, then: { $add: [convertAge(0, 0), 1] } },
      { case: { $eq: ["$metadatas.age.type", "lessThan"] }, then: 0 },
    ],
    default: 0,
  },
};

const maxAgeExpression = {
  $switch: {
    branches: [
      { case: { $eq: ["$metadatas.age.type", "between"] }, then: convertAge(1, 999) },
      { case: { $eq: ["$metadatas.age.type", "moreThan"] }, then: 999 },
      { case: { $eq: ["$metadatas.age.type", "lessThan"] }, then: convertAge(0, 999) },
    ],
    default: 999,
  },
};

const ageConditions: Record<string, Document> = {
  "-18": { $lt: [maxAgeExpression, 18] },
  "18-25": { $and: [{ $gte: [minAgeExpression, 18] }, { $lte: [maxAgeExpression, 25] }] },
  "+25": { $gt: [minAgeExpression, 25] },
};

const buildLocationClause = (departments: string[]): Document => {
  const tokensOrRegexes: (string | RegExp)[] = departments.map((department) =>
    department === "france" || department === "online" || department.includes(" - ")
      ? department
      : new RegExp(` - ${escapeRegExp(department)}$`, "i"),
  );
  tokensOrRegexes.push("france");
  return { "metadatas.location": { $in: tokensOrRegexes } };
};

const isNotBlank = (value: string): boolean => value.trim().length > 0;

/**
 * MongoDB filter of the published contents matching the filters of a widget: the values of a
 * category are OR-ed, the categories are AND-ed, an empty category does not filter.
 */
export const buildDispositifMatch = (filters: WidgetConfigFilters): Document => {
  const clauses: Document[] = [];

  const departments = (filters.departments ?? []).filter(isNotBlank);
  if (departments.length > 0) clauses.push(buildLocationClause(departments));

  const themes = filters.themes ?? [];
  const needs = filters.needs ?? [];
  if (themes.length > 0 && needs.length > 0) {
    clauses.push({ $or: [{ theme: { $in: themes } }, { needs: { $in: needs } }] });
  } else if (themes.length > 0) {
    clauses.push({ theme: { $in: themes } });
  } else if (needs.length > 0) {
    clauses.push({ needs: { $in: needs } });
  }

  const ages = (filters.ages ?? []).flatMap((age) => ageConditions[age] ?? []);
  if (ages.length > 0) clauses.push({ $expr: { $or: ages } });

  const frenchLevels = [
    ...new Set((filters.frenchLevels ?? []).flatMap((level) => frenchLevelValuesByOption[level])),
  ];
  if (frenchLevels.length > 0) clauses.push({ "metadatas.frenchLevel": { $in: frenchLevels } });

  const publics = (filters.publics ?? []).filter(isNotBlank);
  if (publics.length > 0) clauses.push({ "metadatas.public": { $in: publics } });

  const statuses = (filters.statuses ?? []).filter(isNotBlank);
  if (statuses.length > 0) clauses.push({ "metadatas.publicStatus": { $in: statuses } });

  const languages = (filters.languages ?? []).filter(isNotBlank);
  if (languages.length > 0) {
    clauses.push({
      $or: languages.map((language) => ({ [`translations.${language}`]: { $exists: true } })),
    });
  }

  if (filters.contentTypes?.length === 1) clauses.push({ typeContenu: filters.contentTypes[0] });

  return clauses.length > 0 ? { status: "Actif", $and: clauses } : { status: "Actif" };
};

/**
 * The contents of a list widget: the ones matching its filters and the ones added by hand, minus
 * the excluded ones. A content added by hand does not need to match the filters, but it still has
 * to be published.
 */
export const buildListWidgetMatch = ({
  filters,
  selectedDispositifIds,
  excludedDispositifIds,
}: Pick<
  ListWidgetConfig,
  "filters" | "selectedDispositifIds" | "excludedDispositifIds"
>): Document => ({
  $and: [
    { _id: { $nin: excludedDispositifIds } },
    {
      $or: [
        buildDispositifMatch(filters),
        { _id: { $in: selectedDispositifIds }, status: "Actif" },
      ],
    },
  ],
});
