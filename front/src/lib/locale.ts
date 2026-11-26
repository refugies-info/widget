import { DEFAULT_LOCALE } from "./languages.js";

const LOCALE_PATTERN = /^[a-z]{2,3}$/;

export const readInitialLocale = (search: string) => {
  const locale = new URLSearchParams(search).get("locale");
  return locale && LOCALE_PATTERN.test(locale) ? locale : DEFAULT_LOCALE;
};

export const readPreviewFlag = (search: string) =>
  new URLSearchParams(search).get("preview") === "1";

export const readPublicId = (pathname: string) => /^\/w\/([0-9a-f-]{36})\/?$/i.exec(pathname)?.[1];
