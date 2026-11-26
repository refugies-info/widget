import type { Db } from "mongodb";
import { buildTrafficUpdate } from "./traffic.js";
import { type WidgetConfig, widgetConfigSchema } from "./widgetConfig.schema.js";

export interface WidgetConfigRepository {
  findByPublicId: (publicId: string) => Promise<WidgetConfig | null>;
  recordTraffic: (publicId: string, now: Date) => Promise<void>;
}

export const createWidgetConfigRepository = (db: Db): WidgetConfigRepository => ({
  findByPublicId: async (publicId) => {
    const document = await db.collection("widget_config").findOne({ publicId });
    return document ? widgetConfigSchema.parse(document) : null;
  },
  recordTraffic: async (publicId, now) => {
    const { filter, update } = buildTrafficUpdate(publicId, now);
    await db.collection("widget_config").updateOne(filter, update);
  },
});
