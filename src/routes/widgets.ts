import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { DispositifRepository } from "../modules/dispositif/dispositif.repository.js";
import {
  pickEnabledVisitorFilters,
  visitorFiltersQuerySchema,
} from "../modules/dispositif/dispositif.visitorFilters.js";
import { type FilterOptionsRepository } from "../modules/filterOptions/filterOptions.repository.js";
import { findFilterOptions } from "../modules/filterOptions/filterOptions.service.js";
import type { KeywordSearch } from "../modules/search/keywordSearch.js";
import { findActiveWidgetConfig } from "../modules/widgetConfig/findActiveWidgetConfig.js";
import { toPublicWidgetConfig } from "../modules/widgetConfig/widgetConfig.presenter.js";
import type { WidgetConfigRepository } from "../modules/widgetConfig/widgetConfig.repository.js";

const MAX_PAGE = 1000;

const localeSchema = z
  .string()
  .regex(/^[a-z]{2,3}$/)
  .default("fr");

const filterOptionsQuerySchema = z.object({ locale: localeSchema });

const dispositifsQuerySchema = visitorFiltersQuerySchema.extend({
  page: z.coerce.number().int().min(1).max(MAX_PAGE).default(1),
  locale: localeSchema,
});

export const widgetRoutes: FastifyPluginAsync<{
  widgetConfigRepository: WidgetConfigRepository;
  dispositifRepository: DispositifRepository;
  keywordSearch: KeywordSearch;
  filterOptionsRepository: FilterOptionsRepository;
}> = async (
  app,
  { widgetConfigRepository, dispositifRepository, keywordSearch, filterOptionsRepository },
) => {
  const findActiveWidget = (params: unknown) =>
    findActiveWidgetConfig(widgetConfigRepository, params);

  app.get("/widgets/:publicId", async (request, reply) => {
    const config = await findActiveWidget(request.params);
    if (!config) return reply.code(404).send({ error: "Not Found" });

    return toPublicWidgetConfig(config);
  });

  app.get("/widgets/:publicId/dispositifs", async (request, reply) => {
    const config = await findActiveWidget(request.params);
    if (!config) return reply.code(404).send({ error: "Not Found" });

    const query = dispositifsQuerySchema.safeParse(request.query);
    if (!query.success) return reply.code(400).send({ error: "Bad Request" });

    const { page, locale, ...visitorQuery } = query.data;
    const { keyword, filters } = pickEnabledVisitorFilters(config, visitorQuery);
    const matchedDispositifsIds = keyword
      ? await keywordSearch.findMatchedDispositifsIds(keyword)
      : undefined;

    return dispositifRepository.findDisplayedPage(config, {
      page,
      locale,
      filters,
      matchedDispositifsIds,
    });
  });

  app.get("/widgets/:publicId/filters", async (request, reply) => {
    const config = await findActiveWidget(request.params);
    if (!config) return reply.code(404).send({ error: "Not Found" });

    const query = filterOptionsQuerySchema.safeParse(request.query);
    if (!query.success) return reply.code(400).send({ error: "Bad Request" });

    if (config.type !== "list") return {};
    return findFilterOptions(config, query.data.locale, filterOptionsRepository);
  });
};
