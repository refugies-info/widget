import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { DispositifRepository } from "../modules/dispositif/dispositif.repository.js";
import { toPublicWidgetConfig } from "../modules/widgetConfig/widgetConfig.presenter.js";
import type { WidgetConfigRepository } from "../modules/widgetConfig/widgetConfig.repository.js";

const MAX_PAGE = 1000;

const paramsSchema = z.object({ publicId: z.uuid() });

const dispositifsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(MAX_PAGE).default(1),
  locale: z
    .string()
    .regex(/^[a-z]{2,3}$/)
    .default("fr"),
});

export const widgetRoutes: FastifyPluginAsync<{
  widgetConfigRepository: WidgetConfigRepository;
  dispositifRepository: DispositifRepository;
}> = async (app, { widgetConfigRepository, dispositifRepository }) => {
  const findActiveWidgetConfig = async (params: unknown) => {
    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) return null;

    const config = await widgetConfigRepository.findByPublicId(parsedParams.data.publicId);
    return config?.status === "active" ? config : null;
  };

  app.get("/widgets/:publicId", async (request, reply) => {
    const config = await findActiveWidgetConfig(request.params);
    if (!config) return reply.code(404).send({ error: "Not Found" });

    return toPublicWidgetConfig(config);
  });

  app.get("/widgets/:publicId/dispositifs", async (request, reply) => {
    const config = await findActiveWidgetConfig(request.params);
    if (!config) return reply.code(404).send({ error: "Not Found" });

    const query = dispositifsQuerySchema.safeParse(request.query);
    if (!query.success) return reply.code(400).send({ error: "Bad Request" });

    const { page, locale } = query.data;
    return dispositifRepository.findDisplayedPage(config, { page, locale });
  });
};
