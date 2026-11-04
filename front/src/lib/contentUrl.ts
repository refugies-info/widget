import { DEFAULT_LOCALE } from "./languages.js";

const TRANSLATED_PATH = { dispositif: "program", demarche: "procedure" } as const;

export const buildContentUrl = (
  siteUrl: string,
  { id, typeContenu }: { id: string; typeContenu: "dispositif" | "demarche" },
  locale: string,
) =>
  locale === DEFAULT_LOCALE
    ? `${siteUrl}/${typeContenu}/${id}`
    : `${siteUrl}/${locale}/${TRANSLATED_PATH[typeContenu]}/${id}`;
