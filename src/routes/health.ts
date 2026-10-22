import type { FastifyPluginAsync } from "fastify";
import type { Database } from "../db.js";

export const healthRoutes: FastifyPluginAsync<{ database: Pick<Database, "ping"> }> = async (
  app,
  { database },
) => {
  app.get("/health", async (_request, reply) => {
    const databaseUp = await database.ping();
    return reply.code(databaseUp ? 200 : 503).send({ status: databaseUp ? "ok" : "degraded" });
  });
};
