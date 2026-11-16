export type PageItem = number | "ellipsis";

export const buildPageItems = (current: number, pageCount: number): PageItem[] => {
  const wanted = new Set([1, pageCount, current - 1, current, current + 1]);
  const pages = [...wanted].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);

  const items: PageItem[] = [];
  for (const page of pages) {
    const previous = items.at(-1);
    if (typeof previous === "number" && page - previous === 2) items.push(previous + 1);
    else if (typeof previous === "number" && page - previous > 2) items.push("ellipsis");
    items.push(page);
  }
  return items;
};
