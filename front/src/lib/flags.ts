const flagUrls = import.meta.glob<string>("/node_modules/flag-icons/flags/4x3/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
});

export const findFlagUrl = (flagCode: string | null | undefined) =>
  flagCode ? flagUrls[`/node_modules/flag-icons/flags/4x3/${flagCode}.svg`] : undefined;
