import fastifyStatic from "@fastify/static";
import type { FastifyPluginAsync } from "fastify";
import { findActiveWidgetConfig } from "../modules/widgetConfig/findActiveWidgetConfig.js";
import type { WidgetConfigRepository } from "../modules/widgetConfig/widgetConfig.repository.js";

const AUTHORIZED_DOMAIN_PATTERN =
  /^(\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*(:\d{1,5})?$/i;

export const buildFrameAncestors = (authorizedDomains: string[]) => {
  const sources = authorizedDomains
    .filter((domain) => AUTHORIZED_DOMAIN_PATTERN.test(domain))
    .map((domain) => `https://${domain}`);
  return `frame-ancestors ${sources.length > 0 ? sources.join(" ") : "'none'"}`;
};

export const frontRoutes: FastifyPluginAsync<{
  widgetConfigRepository: WidgetConfigRepository;
  frontDirectory: string;
}> = async (app, { widgetConfigRepository, frontDirectory }) => {
  await app.register(fastifyStatic, { root: frontDirectory, index: false });

  // The iframe page: only the sites listed in the widget can embed it
  app.get("/w/:publicId", async (request, reply) => {
    const config = await findActiveWidgetConfig(widgetConfigRepository, request.params);
    if (!config) return reply.code(404).send({ error: "Not Found" });

    return reply
      .header("Content-Security-Policy", buildFrameAncestors(config.authorizedDomains))
      .sendFile("index.html");
  });
};
