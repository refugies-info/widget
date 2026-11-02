import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { connectDatabase } from "./db.js";
import { createDispositifRepository } from "./modules/dispositif/dispositif.repository.js";
import { createFilterOptionsRepository } from "./modules/filterOptions/filterOptions.repository.js";
import { createKeywordSearch } from "./modules/search/keywordSearch.js";
import { createWidgetConfigRepository } from "./modules/widgetConfig/widgetConfig.repository.js";

const config = loadConfig();
const database = await connectDatabase(config.MONGODB_URI);
const app = buildApp(config, {
  database,
  widgetConfigRepository: createWidgetConfigRepository(database.db),
  dispositifRepository: createDispositifRepository(database.db),
  keywordSearch: createKeywordSearch(config),
  filterOptionsRepository: createFilterOptionsRepository(database.db),
});

const shutdown = async () => {
  await app.close();
  await database.close();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

await app.listen({ port: config.PORT, host: config.HOST });
