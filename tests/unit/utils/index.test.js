import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  resolveCookieExpiryDate,
  getRepoParts,
  normalizeAsUrl,
  isObjectEmpty,
  resolveEditorActionFromPathname,
  capitalizeText,
  generateBranchName,
  buildStatsUrl,
  buildWordPathname,
  buildWordSlug,
} from "../../../src/lib/utils/index.js";

describe("resolveCookieExpiryDate", () => {
  it("should add expiry seconds to current time", () => {
    const expireIn = 3600; // 1 hour
    const before = Date.now();
    const result = resolveCookieExpiryDate(expireIn);
    const after = Date.now();

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThanOrEqual(before + expireIn * 1000);
    expect(result.getTime()).toBeLessThanOrEqual(after + expireIn * 1000);
  });

  it("should handle zero expiry time", () => {
    const expireIn = 0;
    const before = Date.now();
    const result = resolveCookieExpiryDate(expireIn);
    const after = Date.now();

    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });

  it("should handle negative expiry time", () => {
    const expireIn = -3600;
    const before = Date.now();
    const result = resolveCookieExpiryDate(expireIn);

    expect(result.getTime()).toBeLessThan(before);
  });
});

describe("getRepoParts", () => {
  it("should split repo fullname correctly", () => {
    expect(getRepoParts("owner/repo")).toEqual({
      repoOwner: "owner",
      repoName: "repo",
    });
  });

  it("should handle complex repo names", () => {
    expect(getRepoParts("jargonsdev/jargons.dev")).toEqual({
      repoOwner: "jargonsdev",
      repoName: "jargons.dev",
    });
  });

  it("should handle repo names with hyphens and dots", () => {
    expect(getRepoParts("my-org/my-repo.name")).toEqual({
      repoOwner: "my-org",
      repoName: "my-repo.name",
    });
  });

  it("should handle empty parts gracefully", () => {
    expect(getRepoParts("/repo")).toEqual({
      repoOwner: "",
      repoName: "repo",
    });

    expect(getRepoParts("owner/")).toEqual({
      repoOwner: "owner",
      repoName: "",
    });
  });
});

describe("normalizeAsUrl", () => {
  it("should convert text to URL-friendly format", () => {
    expect(normalizeAsUrl("Hello World")).toBe("hello-world");
    expect(normalizeAsUrl("API Testing")).toBe("api-testing");
  });

  it("should handle multiple spaces", () => {
    expect(normalizeAsUrl("Multi   Space   Text")).toBe("multi-space-text");
  });

  it("should trim whitespace", () => {
    expect(normalizeAsUrl("  Trimmed Text  ")).toBe("trimmed-text");
  });

  it("should handle already normalized text", () => {
    expect(normalizeAsUrl("already-normalized")).toBe("already-normalized");
  });

  it("should handle empty string", () => {
    expect(normalizeAsUrl("")).toBe("");
  });

  it("should handle special characters", () => {
    expect(normalizeAsUrl("Special & Characters!")).toBe(
      "special-&-characters!",
    );
  });
});

describe("isObjectEmpty", () => {
  it("should return true for empty object", () => {
    expect(isObjectEmpty({})).toBe(true);
  });

  it("should return false for object with properties", () => {
    expect(isObjectEmpty({ key: "value" })).toBe(false);
    expect(isObjectEmpty({ a: 1, b: 2 })).toBe(false);
  });

  it("should return false for object with null/undefined values", () => {
    expect(isObjectEmpty({ key: null })).toBe(false);
    // Note: JSON.stringify removes undefined properties, so { key: undefined } becomes {}
    expect(isObjectEmpty({ key: undefined })).toBe(true);
  });

  it("should handle nested objects", () => {
    expect(isObjectEmpty({ nested: {} })).toBe(false);
  });
});

describe("resolveEditorActionFromPathname", () => {
  it('should extract "new" action from pathname', () => {
    expect(resolveEditorActionFromPathname("/editor/new")).toBe("new");
    expect(resolveEditorActionFromPathname("/editor/new/index")).toBe("new");
  });

  it('should extract "edit" action from pathname', () => {
    expect(resolveEditorActionFromPathname("/editor/edit")).toBe("edit");
    expect(resolveEditorActionFromPathname("/editor/edit/word")).toBe("edit");
  });

  it("should handle case sensitivity", () => {
    expect(resolveEditorActionFromPathname("/editor/NEW")).toBe("new");
    expect(resolveEditorActionFromPathname("/editor/EDIT")).toBe("edit");
  });
});

describe("capitalizeText", () => {
  it("should capitalize first letter of each word", () => {
    expect(capitalizeText("hello world")).toBe("Hello World");
    expect(capitalizeText("api testing")).toBe("Api Testing");
  });

  it("should handle single word", () => {
    expect(capitalizeText("hello")).toBe("Hello");
  });

  it("should handle already capitalized text", () => {
    expect(capitalizeText("Hello World")).toBe("Hello World");
  });

  it("should handle mixed case", () => {
    expect(capitalizeText("hELLo woRLD")).toBe("HELLo WoRLD");
  });

  it("should handle empty string", () => {
    expect(capitalizeText("")).toBe("");
  });

  it("should handle multiple spaces", () => {
    expect(capitalizeText("hello  world")).toBe("Hello  World");
  });
});

describe("generateBranchName", () => {
  it("should generate branch name for new word", () => {
    expect(generateBranchName("new", "API Testing")).toBe(
      "word/new/api-testing",
    );
  });

  it("should generate branch name for edit word", () => {
    expect(generateBranchName("edit", "Hello World")).toBe(
      "word/edit/hello-world",
    );
  });

  it("should handle special characters in word title", () => {
    expect(generateBranchName("new", "API & Testing")).toBe(
      "word/new/api-&-testing",
    );
  });
});

describe("buildStatsUrl", () => {
  it("should build GitHub pull request URL with query", () => {
    const result = buildStatsUrl("owner/repo", "is:pr author:user");
    expect(result).toBe(
      "https://github.com/owner/repo/pulls?q=is%3Apr%20author%3Auser",
    );
  });

  it("should handle special characters in query", () => {
    const result = buildStatsUrl("jargonsdev/jargons.dev", 'label:"new word"');
    expect(result).toBe(
      "https://github.com/jargonsdev/jargons.dev/pulls?q=label%3A%22new%20word%22",
    );
  });

  it("should handle empty query", () => {
    const result = buildStatsUrl("owner/repo", "");
    expect(result).toBe("https://github.com/owner/repo/pulls?q=");
  });
});

describe("buildWordPathname", () => {
  it("should build word pathname from slug", () => {
    expect(buildWordPathname("api")).toBe("/browse/api");
    expect(buildWordPathname("hello-world")).toBe("/browse/hello-world");
  });

  it("should handle empty slug", () => {
    expect(buildWordPathname("")).toBe("/browse/");
  });

  it("should handle special characters", () => {
    expect(buildWordPathname("api-testing")).toBe("/browse/api-testing");
  });
});

describe("buildWordSlug", () => {
  it("should extract slug from file ID", () => {
    expect(buildWordSlug("api.mdx")).toBe("api");
    expect(buildWordSlug("hello-world.mdx")).toBe("hello-world");
  });

  it("should handle multiple dots", () => {
    expect(buildWordSlug("my.file.name.mdx")).toBe("my");
  });

  it("should handle ID without extension", () => {
    expect(buildWordSlug("api")).toBe("api");
  });

  it("should handle empty string", () => {
    expect(buildWordSlug("")).toBe("");
  });
});
