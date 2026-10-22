import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { connectDatabase } from "./db.js";

const config = loadConfig();
const database = await connectDatabase(config.MONGODB_URI);
const app = buildApp(config, database);

const shutdown = async () => {
  await app.close();
  await database.close();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ port: config.PORT, host: config.HOST });
