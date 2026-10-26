import { describe, expect, it } from "vitest";
import { filterSearchHits, matchScore, type SearchCatalog } from "@/lib/search-catalog";

describe("matchScore", () => {
  it("ranks exact and prefix higher", () => {
    expect(matchScore("EDU", "edu")).toBeGreaterThan(matchScore("hello edu world", "edu"));
    expect(matchScore("Сайн дурын эвент", "сайн")).toBeGreaterThan(0);
  });
});

describe("filterSearchHits", () => {
  const catalog: SearchCatalog = {
    events: [
      {
        _id: "e1",
        title: { mn: "Цэвэрлэгээний өдөр" },
        location: { mn: "Улаанбаатар" },
        category: "campaign",
        image: "/e.jpg",
      },
    ],
    news: [
      {
        _id: "n1",
        title: { mn: "VCM шинэ мэдээ" },
        summary: { mn: "Сайн дурынхан цугларлаа" },
        tags: ["сайн дурын"],
      },
    ],
    programs: [{ _id: "p1", code: "edu", name: { mn: "EDU-Volunteer" }, href: "/programs/edu" }],
    courses: [],
    shop: [],
  };

  it("finds across groups and supports filter", () => {
    const all = filterSearchHits(catalog, "сайн", "mn", "all");
    expect(all.some((h) => h.group === "news")).toBe(true);

    const newsOnly = filterSearchHits(catalog, "сайн", "mn", "news");
    expect(newsOnly.every((h) => h.group === "news")).toBe(true);

    const edu = filterSearchHits(catalog, "edu", "mn", "programs");
    expect(edu[0]?.href).toBe("/programs/edu");
  });
});
