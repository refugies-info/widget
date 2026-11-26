import { describe, expect, it } from "vitest";
import { buildTrafficUpdate, shouldRecordTraffic } from "./traffic.js";

const now = new Date("2026-11-26T12:00:00.000Z");

describe("shouldRecordTraffic", () => {
  it("records the first visit", () => {
    expect(shouldRecordTraffic(undefined, now)).toBe(true);
  });

  it("records one visit per hour at most", () => {
    expect(shouldRecordTraffic(new Date("2026-11-26T11:00:01.000Z"), now)).toBe(false);
    expect(shouldRecordTraffic(new Date("2026-11-26T11:00:00.000Z"), now)).toBe(true);
  });
});

describe("buildTrafficUpdate", () => {
  const { filter, update } = buildTrafficUpdate("abc", now);

  it("only writes on an active widget without recent traffic", () => {
    expect(filter).toEqual({
      publicId: "abc",
      status: "active",
      $or: [
        { lastTrafficAt: null },
        { lastTrafficAt: { $lte: new Date("2026-11-26T11:00:00.000Z") } },
      ],
    });
  });

  it("only writes the two dates of the traffic", () => {
    expect(Object.keys(update[0]?.$set ?? {})).toEqual(["activeSinceAt", "lastTrafficAt"]);
  });

  it("keeps the start of the period unless the last traffic is 3 days old or more", () => {
    expect(update[0]?.$set.activeSinceAt.$cond).toEqual({
      if: { $gt: ["$lastTrafficAt", new Date("2026-11-23T12:00:00.000Z")] },
      then: { $ifNull: ["$activeSinceAt", "$lastTrafficAt"] },
      else: now,
    });
  });
});
