import type { Db } from "mongodb";
import { type WidgetConfig, widgetConfigSchema } from "./widgetConfig.schema.js";

export interface WidgetConfigRepository {
  findByPublicId: (publicId: string) => Promise<WidgetConfig | null>;
}

export const createWidgetConfigRepository = (db: Db): WidgetConfigRepository => ({
  findByPublicId: async (publicId) => {
    const document = await db.collection("widget_config").findOne({ publicId });
    return document ? widgetConfigSchema.parse(document) : null;
  },
});
