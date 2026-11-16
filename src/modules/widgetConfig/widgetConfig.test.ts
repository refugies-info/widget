import { ObjectId } from "mongodb";
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

const thumbnailConfigDocument = {
  _id: "6710f2a1c3d4e5f607182940",
  publicId: "9a4d2c11-5b7e-4f3a-b8d0-1c6e2f9a7b34",
  status: "active",
  statusUpdatedAt: new Date("2026-10-01T09:00:00.000Z"),
  internalTitle: "Widget titre de voyage",
  type: "thumbnail",
  structureName: "Association Exemple",
  authorizedDomains: ["exemple.org"],
  externalTitle: "Demander un titre de voyage",
  dispositifId: "6710f2a1c3d4e5f607182931",
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

describe("thumbnail widget", () => {
  it("accepts a document with only its own fields", () => {
    const parsed = widgetConfigSchema.safeParse(thumbnailConfigDocument);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.type === "thumbnail" && parsed.data.dispositifId).toEqual(
      new ObjectId("6710f2a1c3d4e5f607182931"),
    );
  });

  it("requires the content to display", () => {
    const { dispositifId: _dispositifId, ...withoutContent } = thumbnailConfigDocument;
    expect(widgetConfigSchema.safeParse(withoutContent).success).toBe(false);
  });

  it("rejects an unknown widget type", () => {
    expect(
      widgetConfigSchema.safeParse({ ...thumbnailConfigDocument, type: "carousel" }).success,
    ).toBe(false);
  });
});

describe("toPublicWidgetConfig", () => {
  const config = widgetConfigSchema.parse(widgetConfigDocument);
  const thumbnail = widgetConfigSchema.parse(thumbnailConfigDocument);

  it("never exposes internal fields", () => {
    for (const widget of [config, thumbnail]) {
      const keys = Object.keys(toPublicWidgetConfig(widget));
      for (const internalKey of [
        "_id",
        "internalTitle",
        "structureName",
        "status",
        "filters",
        "selectedDispositifIds",
        "excludedDispositifIds",
        "dispositifId",
        "createdAt",
        "updatedAt",
      ]) {
        expect(keys).not.toContain(internalKey);
      }
    }
  });

  it("exposes the authorized domains for the frame-ancestors CSP", () => {
    expect(toPublicWidgetConfig(config).authorizedDomains).toEqual(["exemple.org"]);
    expect(toPublicWidgetConfig(thumbnail).authorizedDomains).toEqual(["exemple.org"]);
  });

  it("hides the description when it is not displayed", () => {
    if (config.type !== "list") throw new Error("expected a list widget");
    const hidden = toPublicWidgetConfig({ ...config, displayDescription: false });
    expect(hidden).toHaveProperty("description", undefined);
  });
});

describe("widgetConfigSchema fields", () => {
  const [listSchema, thumbnailSchema] = widgetConfigSchema.options;
  const commonPublicKeys = ["publicId", "type", "authorizedDomains", "externalTitle"];

  const listPublicKeys = [
    ...commonPublicKeys,
    "description",
    "displayDescription",
    "pageSize",
    "sortBy",
    "displayShareModule",
    "displayFilterBar",
    "filterBarOptions",
  ];
  const listInternalKeys = ["status", "filters", "selectedDispositifIds", "excludedDispositifIds"];

  const thumbnailPublicKeys = commonPublicKeys;
  const thumbnailInternalKeys = ["status", "dispositifId"];

  it("classifies every field of a list widget as public or internal", () => {
    const classified = [...listPublicKeys, ...listInternalKeys].sort();
    expect(Object.keys(listSchema.shape).sort()).toEqual(classified);
  });

  it("classifies every field of a thumbnail widget as public or internal", () => {
    const classified = [...thumbnailPublicKeys, ...thumbnailInternalKeys].sort();
    expect(Object.keys(thumbnailSchema.shape).sort()).toEqual(classified);
  });

  it("exposes exactly the public fields of each type", () => {
    const list = widgetConfigSchema.parse(widgetConfigDocument);
    const thumbnail = widgetConfigSchema.parse(thumbnailConfigDocument);

    expect(Object.keys(toPublicWidgetConfig(list)).sort()).toEqual([...listPublicKeys].sort());
    expect(Object.keys(toPublicWidgetConfig(thumbnail)).sort()).toEqual(
      [...thumbnailPublicKeys].sort(),
    );
  });
});
