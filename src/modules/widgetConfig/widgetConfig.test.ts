import { describe, expect, it } from "vitest";
import { toPublicWidgetConfig } from "./widgetConfig.presenter.js";
import { widgetConfigSchema } from "./widgetConfig.schema.js";

const widgetConfigDocument = {
  _id: "6710f2a1c3d4e5f607182930",
  publicId: "3f1c7a52-9b4e-4d6a-8c21-5e0a7b9d4f13",
  status: "active",
  statusUpdatedAt: new Date("2026-10-01T09:00:00.000Z"),
  createdAt: new Date("2026-10-01T09:00:00.000Z"),
  updatedAt: new Date("2026-10-02T09:00:00.000Z"),
  internalTitle: "Widget Bordeaux",
  type: "list",
  structureName: "Association Exemple",
  authorizedDomains: ["exemple.org"],
  externalTitle: "Les fiches de Bordeaux",
  description: "Toutes les fiches utiles à Bordeaux.",
  displayDescription: true,
  filters: { departments: ["Gironde"], contentTypes: ["dispositif"] },
  selectedDispositifIds: ["6710f2a1c3d4e5f607182931"],
  excludedDispositifIds: [],
  pageSize: 8,
  sortBy: "date",
  displayShareModule: true,
  displayFilterBar: true,
  filterBarOptions: ["keyword", "location"],
  __v: 0,
};

describe("widgetConfigSchema", () => {
  it("accepts a valid widget config document", () => {
    expect(widgetConfigSchema.safeParse(widgetConfigDocument).success).toBe(true);
  });

  it("rejects a document with an unknown status", () => {
    expect(widgetConfigSchema.safeParse({ ...widgetConfigDocument, status: "draft" }).success).toBe(
      false,
    );
  });
});

describe("toPublicWidgetConfig", () => {
  const config = widgetConfigSchema.parse(widgetConfigDocument);

  it("never exposes internal fields", () => {
    const keys = Object.keys(toPublicWidgetConfig(config));
    for (const internalKey of [
      "_id",
      "internalTitle",
      "structureName",
      "status",
      "filters",
      "selectedDispositifIds",
      "excludedDispositifIds",
      "createdAt",
      "updatedAt",
    ]) {
      expect(keys).not.toContain(internalKey);
    }
  });

  it("exposes the authorized domains for the frame-ancestors CSP", () => {
    expect(toPublicWidgetConfig(config).authorizedDomains).toEqual(["exemple.org"]);
  });

  it("hides the description when it is not displayed", () => {
    const hidden = toPublicWidgetConfig({ ...config, displayDescription: false });
    expect(hidden.description).toBeUndefined();
  });
});

describe("widgetConfigSchema fields", () => {
  const publicKeys = [
    "publicId",
    "type",
    "authorizedDomains",
    "externalTitle",
    "description",
    "displayDescription",
    "pageSize",
    "sortBy",
    "displayShareModule",
    "displayFilterBar",
    "filterBarOptions",
  ];
  const internalKeys = ["status", "filters", "selectedDispositifIds", "excludedDispositifIds"];

  it("classifies every schema field as public or internal", () => {
    const classified = [...publicKeys, ...internalKeys].sort();
    expect(Object.keys(widgetConfigSchema.shape).sort()).toEqual(classified);
  });

  it("exposes exactly the public fields", () => {
    const config = widgetConfigSchema.parse(widgetConfigDocument);
    expect(Object.keys(toPublicWidgetConfig(config)).sort()).toEqual([...publicKeys].sort());
  });
});
