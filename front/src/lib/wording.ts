export interface Wording {
  translateLabel: string;
  translateHint: string;
  sourceLong: string;
  emptyTitle: string;
  emptyText: string;
}

export type WordingKey = keyof Wording;

const BRAND = "Réfugiés.info";

const WORDING: Record<string, Partial<Wording>> & { fr: Wording } = {
  fr: {
    translateLabel: "Traduire :",
    translateHint: "Cliquer pour lire et écouter les explications traduites",
    sourceLong: `${BRAND} : l’information pour les réfugiés en France`,
    emptyTitle: "Le widget est vide.",
    emptyText: "Choisissez une fiche pour obtenir un aperçu.",
  },
  en: {
    translateLabel: "Translate:",
    translateHint: "Click to read and listen to the translated explanations",
    sourceLong: `${BRAND}: information for refugees in France`,
    emptyTitle: "The widget is empty.",
    emptyText: "Choose a content to get a preview.",
  },
  ar: { sourceLong: `${BRAND} : معلومات للاجئين في فرنسا` },
  ps: { sourceLong: `${BRAND} : په فرانسه کې د کډوالو لپاره معلومات` },
  fa: { sourceLong: `${BRAND} : اطلاعات برای پناهندگان در فرانسه` },
  uk: { sourceLong: `${BRAND} : Інформація для біженців у Франції` },
  ru: { sourceLong: `${BRAND} : Полезная информация для беженцев во Франции` },
  ti: { sourceLong: `${BRAND} : ሓበሬታ ን ስደተኛታት ኣብ ፈረንሳ` },
};

export const translate = (locale: string, key: WordingKey) =>
  WORDING[locale]?.[key] ?? WORDING.fr[key];
