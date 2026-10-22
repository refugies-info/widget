import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { toPublicWidgetConfig } from "../modules/widgetConfig/widgetConfig.presenter.js";
import type { WidgetConfigRepository } from "../modules/widgetConfig/widgetConfig.repository.js";

const paramsSchema = z.object({ publicId: z.uuid() });

export const widgetRoutes: FastifyPluginAsync<{
  widgetConfigRepository: WidgetConfigRepository;
}> = async (app, { widgetConfigRepository }) => {
  app.get("/widgets/:publicId", async (request, reply) => {
    const notFound = () => reply.code(404).send({ error: "Not Found" });

    // A malformed id gets the same answer as an unknown one
    const params = paramsSchema.safeParse(request.params);
    if (!params.success) return notFound();

    const config = await widgetConfigRepository.findByPublicId(params.data.publicId);
    if (!config || config.status !== "active") return notFound();

    return toPublicWidgetConfig(config);
  });
};
