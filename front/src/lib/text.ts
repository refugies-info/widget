export const capitalize = (text: string, locale: string) =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

export const plainText = (html: string | null | undefined) =>
  html ? (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "") : "";
