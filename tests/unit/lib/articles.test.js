import { describe, expect, it } from "vitest";
import {
  formatArticleDate,
  sortArticlesByDate,
} from "../../../src/lib/articles.js";

describe("sortArticlesByDate", () => {
  it("returns articles newest first without mutating the input", () => {
    const older = {
      id: "older",
      data: { title: "Older", publishedAt: new Date("2025-01-01") },
    };
    const newer = {
      id: "newer",
      data: { title: "Newer", publishedAt: new Date("2026-01-01") },
    };
    const articles = [older, newer];

    expect(sortArticlesByDate(articles)).toEqual([newer, older]);
    expect(articles).toEqual([older, newer]);
  });

  it("sorts equal dates by title", () => {
    const articles = [
      { data: { title: "Tuple", publishedAt: new Date("2026-01-01") } },
      { data: { title: "Singleton", publishedAt: new Date("2026-01-01") } },
    ];

    expect(sortArticlesByDate(articles).map(({ data }) => data.title)).toEqual([
      "Singleton",
      "Tuple",
    ]);
  });
});

describe("formatArticleDate", () => {
  it("formats dates consistently in UTC", () => {
    expect(formatArticleDate(new Date("2026-11-24T00:00:00.000Z"))).toBe(
      "November 24, 2026",
    );
  });
});
