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

/** Some images are served by the site itself and stored as a path, e.g. "/images/cards/…". */
export const buildImageUrl = (siteUrl: string, imageUrl: string) => new URL(imageUrl, siteUrl).href;
