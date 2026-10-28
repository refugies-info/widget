import { z } from "zod";

const contentTypeSchema = z.enum(["dispositif", "demarche"]);

export const displayedThumbnailSchema = z.object({
  id: z.string(),
  typeContenu: contentTypeSchema,
  titreInformatif: z.string().nullish(),
  abstract: z.string().nullish(),
  imageUrl: z.string().nullish(),
});

export const displayedCardSchema = z.object({
  id: z.string(),
  typeContenu: contentTypeSchema,
  titreInformatif: z.string().nullish(),
  abstract: z.string().nullish(),
  location: z.union([z.string(), z.array(z.string())]).nullish(),
  theme: z
    .object({
      name: z.string().nullish(),
      color: z.string().nullish(),
      imageUrl: z.string().nullish(),
    })
    .nullish(),
  secondaryThemeCount: z.number(),
  sponsor: z.object({ name: z.string(), pictureUrl: z.string().nullish() }).nullish(),
  // Raw values: the front formats them ("Gratuit", "10 mois")
  price: z.object({ values: z.array(z.number()), details: z.string().nullish() }).nullish(),
  commitment: z
    .object({
      amountDetails: z.string(),
      hours: z.array(z.number()),
      timeUnit: z.string(),
    })
    .nullish(),
  lastModificationDate: z.date().nullish(),
});

export type DisplayedThumbnail = z.infer<typeof displayedThumbnailSchema>;
export type DisplayedCard = z.infer<typeof displayedCardSchema>;
export type DisplayedDispositif = DisplayedThumbnail | DisplayedCard;
