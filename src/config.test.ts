import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

const requiredEnv = {
  MONGODB_URI: "mongodb://localhost:27017/refugies",
  ALGOLIA_APP_ID: "demo",
  ALGOLIA_SEARCH_API_KEY: "demo",
  ALGOLIA_INDEX_NAME: "demo",
};

describe("EDITOR_ORIGINS", () => {
  it("is empty by default", () => {
    expect(loadConfig(requiredEnv).EDITOR_ORIGINS).toEqual([]);
  });

  it("reads a comma-separated list of origins", () => {
    const config = loadConfig({
      ...requiredEnv,
      EDITOR_ORIGINS: "https://bomo.refugies.info, http://localhost:3001",
    });
    expect(config.EDITOR_ORIGINS).toEqual(["https://bomo.refugies.info", "http://localhost:3001"]);
  });

  it.each(["https://bomo.refugies.info/", "https://bomo.refugies.info/page", "bomo.refugies.info"])(
    "rejects %s, which is not an origin",
    (value) => {
      expect(() => loadConfig({ ...requiredEnv, EDITOR_ORIGINS: value })).toThrow();
    },
  );
});
