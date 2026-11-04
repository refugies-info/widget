import type { Db } from "mongodb";
import { z } from "zod";

const themeDocumentSchema = z.object({
  _id: z.custom<{ toString: () => string }>(),
  short: z.record(z.string(), z.string().nullish()).nullish(),
  colors: z.object({ color40: z.string().nullish() }).nullish(),
});

const languageDocumentSchema = z.object({
  i18nCode: z.string(),
  langueFr: z.string(),
  langueLoc: z.string().nullish(),
});

export interface ThemeOption {
  id: string;
  name: string;
  color: string | null;
}

export interface LanguageOption {
  code: string;
  name: string;
  localName: string | null;
}

export interface FilterOptionsRepository {
  findThemes: (locale: string) => Promise<ThemeOption[]>;
  findLanguages: () => Promise<LanguageOption[]>;
}

export const createFilterOptionsRepository = (db: Db): FilterOptionsRepository => ({
  findThemes: async (locale) => {
    const documents = await db
      .collection("themes")
      .find({}, { projection: { short: 1, "colors.color40": 1 } })
      .sort({ position: 1, _id: 1 })
      .toArray();

    return documents.flatMap((document) => {
      const { _id, short, colors } = themeDocumentSchema.parse(document);
      const name = short?.[locale] || short?.fr;
      return name ? [{ id: _id.toString(), name, color: colors?.color40 ?? null }] : [];
    });
  },

  findLanguages: async () => {
    const documents = await db
      .collection("langues")
      .find(
        { i18nCode: { $ne: "fr" } },
        { projection: { _id: 0, i18nCode: 1, langueFr: 1, langueLoc: 1 } },
      )
      .sort({ langueFr: 1 })
      .toArray();

    return documents.map((document) => {
      const { i18nCode, langueFr, langueLoc } = languageDocumentSchema.parse(document);
      return { code: i18nCode, name: langueFr, localName: langueLoc ?? null };
    });
  },
});
