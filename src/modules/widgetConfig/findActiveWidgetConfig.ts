import { z } from "zod";
import type { WidgetConfigRepository } from "./widgetConfig.repository.js";

const paramsSchema = z.object({ publicId: z.uuid() });

export const findActiveWidgetConfig = async (
  widgetConfigRepository: WidgetConfigRepository,
  params: unknown,
) => {
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) return null;

  const config = await widgetConfigRepository.findByPublicId(parsedParams.data.publicId);
  return config?.status === "active" ? config : null;
};
