export interface PublicWidgetConfig {
  publicId: string;
  type: "thumbnail" | "list";
  externalTitle: string;
}

export interface DisplayedThumbnail {
  id: string;
  typeContenu: "dispositif" | "demarche";
  titreInformatif?: string | null;
  abstract?: string | null;
  imageUrl?: string | null;
  availableLanguages: string[];
}

export class WidgetNotFoundError extends Error {}

const getJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(path);
  if (response.status === 404) throw new WidgetNotFoundError();
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${path}`);
  return response.json() as Promise<T>;
};

export const fetchWidgetConfig = (publicId: string) =>
  getJson<PublicWidgetConfig>(`/widgets/${publicId}`);

export const fetchThumbnail = async (publicId: string, locale: string) => {
  const page = await getJson<{ items: DisplayedThumbnail[] }>(
    `/widgets/${publicId}/dispositifs?locale=${locale}`,
  );
  return page.items[0] ?? null;
};
