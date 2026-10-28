import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { buildDispositifMatch } from "./dispositif.match.js";
import { buildPresentationStages, buildSortStages, planPage } from "./dispositif.pipeline.js";

describe("buildDispositifMatch", () => {
  it("only asks for published contents without filters", () => {
    expect(buildDispositifMatch({})).toEqual({ status: "Actif" });
    expect(buildDispositifMatch({ departments: [], themes: [], publics: [" "] })).toEqual({
      status: "Actif",
    });
  });

  it("always includes the contents available in all of France when filtering on a department", () => {
    const { $and } = buildDispositifMatch({ departments: ["Gironde", "online"] });
    const [{ "metadatas.location": location }] = $and;

    expect(location.$in).toHaveLength(3);
    expect(location.$in[0].test("Bordeaux - Gironde")).toBe(true);
    expect(location.$in[0].test("Gironde - Bordeaux")).toBe(false);
    expect(location.$in.slice(1)).toEqual(["online", "france"]);
  });

  it("escapes the regex characters of a department", () => {
    const { $and } = buildDispositifMatch({ departments: ["Côtes-d'Armor (.*)"] });
    const [regex] = $and[0]["metadatas.location"].$in;

    expect(regex.test("Saint-Brieuc - Côtes-d'Armor (.*)")).toBe(true);
    expect(regex.test("Saint-Brieuc - Côtes-d'Armor (xx)")).toBe(false);
  });

  it("matches a theme or a need when both are selected", () => {
    const theme = new ObjectId();
    const need = new ObjectId();

    expect(buildDispositifMatch({ themes: [theme], needs: [need] }).$and).toEqual([
      { $or: [{ theme: { $in: [theme] } }, { needs: { $in: [need] } }] },
    ]);
    expect(buildDispositifMatch({ themes: [theme] }).$and).toEqual([{ theme: { $in: [theme] } }]);
    expect(buildDispositifMatch({ needs: [need] }).$and).toEqual([{ needs: { $in: [need] } }]);
  });

  it("converts the French level categories to levels", () => {
    expect(buildDispositifMatch({ frenchLevels: ["a", "b", "a"] }).$and).toEqual([
      { "metadatas.frenchLevel": { $in: ["A1", "A2", "B1", "B2"] } },
    ]);
  });

  it("ANDs the categories and ORs the values of a category", () => {
    const match = buildDispositifMatch({
      publics: ["women", "refugee"],
      statuses: ["asile"],
      languages: ["ar", "fa"],
    });

    expect(match.$and).toEqual([
      { "metadatas.public": { $in: ["women", "refugee"] } },
      { "metadatas.publicStatus": { $in: ["asile"] } },
      { $or: [{ "translations.ar": { $exists: true } }, { "translations.fa": { $exists: true } }] },
    ]);
  });

  it("ORs the age ranges", () => {
    const { $and } = buildDispositifMatch({ ages: ["-18", "+25"] });
    expect($and[0].$expr.$or).toHaveLength(2);
  });

  it("filters on a single content type only", () => {
    expect(buildDispositifMatch({ contentTypes: ["demarche"] }).$and).toEqual([
      { typeContenu: "demarche" },
    ]);
    expect(buildDispositifMatch({ contentTypes: ["demarche", "dispositif"] })).toEqual({
      status: "Actif",
    });
  });
});

describe("buildSortStages", () => {
  it.each([
    ["date", { publishedAt: -1, _id: 1 }],
    ["views", { nbVues: -1, _id: 1 }],
    ["location", { isLocal: 1, "metadatas.vues": -1, _id: 1 }],
    ["theme", { themeSortIndex: 1, publishedAt: -1, _id: 1 }],
  ] as const)("sorts by %s with the id as a tie-breaker", (sortBy, expectedSort) => {
    const sort = buildSortStages(sortBy).find((stage) => "$sort" in stage);
    expect(sort).toEqual({ $sort: expectedSort });
  });

  it("only joins the themes to sort by theme", () => {
    const lookups = (sortBy: "date" | "views" | "location" | "theme") =>
      buildSortStages(sortBy).filter((stage) => "$lookup" in stage);

    expect(lookups("theme")).toHaveLength(1);
    expect(lookups("date")).toHaveLength(0);
  });
});

describe("buildPresentationStages", () => {
  const joinedCollections = (type: "list" | "thumbnail") =>
    buildPresentationStages("en", type)
      .filter((stage) => "$lookup" in stage)
      .map((stage) => stage.$lookup.from);

  const projection = (type: "list" | "thumbnail") =>
    buildPresentationStages("en", type).find((stage) => "$project" in stage)?.$project;

  it("only joins the theme of a thumbnail, and also the sponsor of a list", () => {
    expect(joinedCollections("thumbnail")).toEqual(["themes"]);
    expect(joinedCollections("list")).toEqual(["themes", "structures"]);
  });

  it("falls back to French and never keeps the Mongo id or the translations", () => {
    for (const type of ["list", "thumbnail"] as const) {
      expect(projection(type)?._id).toBe(0);
      expect(projection(type)?.translations).toBeUndefined();
      expect(projection(type)?.abstract).toEqual({
        $ifNull: ["$translations.en.content.abstract", "$translations.fr.content.abstract"],
      });
    }
  });

  it("keeps a thumbnail to a title, an abstract and an image", () => {
    expect(Object.keys(projection("thumbnail") ?? {}).sort()).toEqual([
      "_id",
      "abstract",
      "id",
      "imageUrl",
      "titreInformatif",
      "typeContenu",
    ]);
  });

  it("keeps the raw price, commitment and update date of a card for the front to format", () => {
    expect(projection("list")).toMatchObject({
      price: "$metadatas.price",
      commitment: "$metadatas.commitment",
      lastModificationDate: 1,
    });
  });
});

describe("planPage", () => {
  it("fills the first page with the selected contents", () => {
    expect(planPage({ selectedCount: 3, page: 1, pageSize: 4 })).toEqual({
      selectedStart: 0,
      selectedEnd: 3,
      filteredSkip: 0,
      filteredLimit: 1,
    });
  });

  it("continues with the filtered contents after the selected ones", () => {
    expect(planPage({ selectedCount: 3, page: 2, pageSize: 4 })).toEqual({
      selectedStart: 3,
      selectedEnd: 3,
      filteredSkip: 1,
      filteredLimit: 4,
    });
  });

  it("spreads the selected contents over several pages", () => {
    expect(planPage({ selectedCount: 6, page: 2, pageSize: 4 })).toEqual({
      selectedStart: 4,
      selectedEnd: 6,
      filteredSkip: 0,
      filteredLimit: 2,
    });
  });

  it("has no selected content to show without selection", () => {
    expect(planPage({ selectedCount: 0, page: 3, pageSize: 8 })).toEqual({
      selectedStart: 0,
      selectedEnd: 0,
      filteredSkip: 16,
      filteredLimit: 8,
    });
  });
});
