export const DEFAULT_LOCALE = "fr";

export interface Language {
  code: string;
  label: string;
  flagCode: string;
}

export const SITE_LANGUAGES: Language[] = [
  { code: "fr", label: "Français", flagCode: "fr" },
  { code: "en", label: "English", flagCode: "gb" },
  { code: "ar", label: "العربية", flagCode: "sa" },
  { code: "ps", label: "پښتو", flagCode: "af" },
  { code: "fa", label: "فارسی", flagCode: "ir" },
  { code: "uk", label: "українська", flagCode: "ua" },
  { code: "ru", label: "русский", flagCode: "ru" },
  { code: "ti", label: "ትግርኛ", flagCode: "er" },
];

const RTL_LOCALES = ["ar", "ps", "fa"];

export const isRtl = (locale: string) => RTL_LOCALES.includes(locale);

export const isLanguageAvailable = (code: string, availableLanguages: string[] | undefined) =>
  code === DEFAULT_LOCALE || availableLanguages === undefined || availableLanguages.includes(code);
