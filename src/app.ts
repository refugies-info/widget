import Fastify, { type FastifyInstance } from "fastify";
import type { Config } from "./config.js";
import type { Database } from "./db.js";
import { healthRoutes } from "./routes/health.js";

export const buildApp = (
  config: Pick<Config, "LOG_LEVEL">,
  database: Pick<Database, "ping">,
): FastifyInstance => {
  const app = Fastify({ logger: { level: config.LOG_LEVEL } });
  app.register(healthRoutes, { database });
  return app;
};
