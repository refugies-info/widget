export interface PublicThumbnailWidgetConfig {
  publicId: string;
  type: "thumbnail";
  externalTitle: string;
}

export interface PublicListWidgetConfig {
  publicId: string;
  type: "list";
  externalTitle: string;
  description?: string;
  displayDescription: boolean;
  pageSize: number;
  displayShareModule: boolean;
  displayFilterBar: boolean;
  filterBarOptions: string[];
}

export type PublicWidgetConfig = PublicThumbnailWidgetConfig | PublicListWidgetConfig;

export interface DisplayedThumbnail {
  id: string;
  typeContenu: "dispositif" | "demarche";
  titreInformatif?: string | null;
  abstract?: string | null;
  imageUrl?: string | null;
  availableLanguages: string[];
}

export interface DisplayedCard {
  id: string;
  typeContenu: "dispositif" | "demarche";
  titreInformatif?: string | null;
  abstract?: string | null;
  location?: string | string[] | null;
  theme?: { name?: string | null; color?: string | null; imageUrl?: string | null } | null;
  secondaryThemeCount: number;
  sponsor?: { name: string; pictureUrl?: string | null } | null;
  price?: { values: number[]; details?: string | null } | null;
  commitment?: { amountDetails: string; hours: number[]; timeUnit: string } | null;
  lastModificationDate?: string | null;
}

export interface ListPage {
  items: DisplayedCard[];
  total: number;
  page: number;
  pageCount: number;
}

export class WidgetNotFoundError extends Error {}

const getJson = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(path, { signal });
  if (response.status === 404) throw new WidgetNotFoundError();
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${path}`);
  return response.json() as Promise<T>;
};

export const fetchWidgetConfig = (publicId: string, signal?: AbortSignal) =>
  getJson<PublicWidgetConfig>(`/widgets/${publicId}`, signal);

export const fetchThumbnail = async (publicId: string, locale: string, signal?: AbortSignal) => {
  const page = await getJson<{ items: DisplayedThumbnail[] }>(
    `/widgets/${publicId}/dispositifs?locale=${locale}`,
    signal,
  );
  return page.items[0] ?? null;
};

export const fetchList = (publicId: string, locale: string, page: number, signal?: AbortSignal) =>
  getJson<ListPage>(`/widgets/${publicId}/dispositifs?locale=${locale}&page=${page}`, signal);
