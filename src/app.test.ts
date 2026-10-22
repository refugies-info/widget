import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("GET /health", () => {
  it("returns 200 when the database answers", async () => {
    const app = buildApp({ LOG_LEVEL: "silent" }, { ping: async () => true });
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("returns 503 when the database is down", async () => {
    const app = buildApp({ LOG_LEVEL: "silent" }, { ping: async () => false });
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(503);
  });
});
