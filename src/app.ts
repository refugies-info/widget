import Fastify, { type FastifyInstance } from "fastify";
import type { Config } from "./config.js";
import type { Database } from "./db.js";
import type { DispositifRepository } from "./modules/dispositif/dispositif.repository.js";
import type { WidgetConfigRepository } from "./modules/widgetConfig/widgetConfig.repository.js";
import { healthRoutes } from "./routes/health.js";
import { widgetRoutes } from "./routes/widgets.js";

export interface AppDependencies {
  database: Pick<Database, "ping">;
  widgetConfigRepository: WidgetConfigRepository;
  dispositifRepository: DispositifRepository;
}

export const buildApp = (
  config: Pick<Config, "LOG_LEVEL">,
  { database, widgetConfigRepository, dispositifRepository }: AppDependencies,
): FastifyInstance => {
  const app = Fastify({ logger: { level: config.LOG_LEVEL } });
  app.register(healthRoutes, { database });
  app.register(widgetRoutes, { widgetConfigRepository, dispositifRepository });
  return app;
};
