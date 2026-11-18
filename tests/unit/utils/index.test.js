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
  toggleMarkdownListPrefix,
  continueMarkdownListOnEnter,
  toggleMarkdownWrap,
  toggleMarkdownCodeBlock,
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
    // In this test, objects with only undefined values are considered empty.
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

describe("toggleMarkdownListPrefix", () => {
  it("adds and toggles off an unordered prefix at the cursor line", () => {
    const added = toggleMarkdownListPrefix("item", 0, 0, "- ");
    expect(added).toEqual({ value: "- item", start: 2, end: 2 });

    expect(
      toggleMarkdownListPrefix(added.value, added.start, added.end, "- "),
    ).toEqual({
      value: "item",
      start: 0,
      end: 0,
    });
  });

  it("switches an existing unordered prefix to an ordered prefix", () => {
    const switched = toggleMarkdownListPrefix("- item", 2, 6, "1. ");
    expect(switched).toEqual({
      value: "1. item",
      start: 3,
      end: 7,
    });

    expect(
      toggleMarkdownListPrefix(
        switched.value,
        switched.start,
        switched.end,
        "1. ",
      ),
    ).toEqual({
      value: "item",
      start: 0,
      end: 4,
    });
  });

  it("toggles selected lines individually and preserves their selection", () => {
    const value = "- first\n1. second\nthird";

    expect(toggleMarkdownListPrefix(value, 0, value.length, "- ")).toEqual({
      value: "first\n- second\n- third",
      start: 0,
      end: 22,
    });
  });
});

describe("continueMarkdownListOnEnter", () => {
  it("continues a bullet list at the cursor", () => {
    expect(continueMarkdownListOnEnter("- first", 7, 7)).toEqual({
      value: "- first\n- ",
      start: 10,
      end: 10,
    });
  });

  it("increments an ordered list marker", () => {
    expect(continueMarkdownListOnEnter("3. first", 8, 8)).toEqual({
      value: "3. first\n4. ",
      start: 12,
      end: 12,
    });
  });

  it("removes an empty item's prefix without changing the prior item", () => {
    expect(continueMarkdownListOnEnter("- first\n- ", 10, 10)).toEqual({
      value: "- first\n",
      start: 8,
      end: 8,
    });
  });

  it("splits the current item at the caret", () => {
    expect(continueMarkdownListOnEnter("- first last", 7, 7)).toEqual({
      value: "- first\n-  last",
      start: 10,
      end: 10,
    });
  });

  it("leaves Enter unchanged outside a list item or with a selection", () => {
    expect(continueMarkdownListOnEnter("plain text", 4, 4)).toBeNull();
    expect(continueMarkdownListOnEnter("- first", 2, 4)).toBeNull();
  });
});

describe("Markdown wrapper toggles", () => {
  it("removes a bold wrapper around selected text", () => {
    expect(toggleMarkdownWrap("**bold text**", 2, 11, "**")).toEqual({
      value: "bold text",
      start: 0,
      end: 9,
    });
  });

  it("removes a wrapper when only part of its text is selected", () => {
    expect(toggleMarkdownWrap("**bold text**", 7, 11, "**")).toEqual({
      value: "bold text",
      start: 5,
      end: 9,
    });
  });

  it("removes empty bold delimiters around a cursor", () => {
    expect(toggleMarkdownWrap("****", 2, 2, "**")).toEqual({
      value: "",
      start: 0,
      end: 0,
    });
  });

  it("removes a wrapper when the selection includes its delimiters", () => {
    expect(toggleMarkdownWrap("**bold**", 0, 8, "**")).toEqual({
      value: "bold",
      start: 0,
      end: 4,
    });
  });

  it("removes empty italic delimiters around the cursor", () => {
    expect(toggleMarkdownWrap("__", 1, 1, "_")).toEqual({
      value: "",
      start: 0,
      end: 0,
    });
  });

  it("removes inline-code delimiters around selected text", () => {
    expect(toggleMarkdownWrap("`code`", 1, 5, "`")).toEqual({
      value: "code",
      start: 0,
      end: 4,
    });
  });

  it("switches inline code to a fenced code block", () => {
    expect(toggleMarkdownCodeBlock("`console.log()`", 1, 14)).toEqual({
      value: "```\nconsole.log()\n```",
      start: 4,
      end: 17,
    });
  });

  it("preserves a partial selection when switching inline code to a block", () => {
    expect(toggleMarkdownCodeBlock("call `console.log()` now", 15, 18)).toEqual(
      {
        value: "call \n```\nconsole.log()\n```\n now",
        start: 19,
        end: 22,
      },
    );
  });

  it("switches a fenced code block to inline code", () => {
    expect(toggleMarkdownWrap("```\nconsole.log()\n```", 4, 17, "`")).toEqual({
      value: "`console.log()`",
      start: 1,
      end: 14,
    });
  });

  it("removes a fenced code block around selected code", () => {
    expect(toggleMarkdownCodeBlock("```\nconsole.log()\n```", 4, 17)).toEqual({
      value: "console.log()",
      start: 0,
      end: 13,
    });
  });

  it("removes an empty code block around the cursor", () => {
    expect(toggleMarkdownCodeBlock("```\n\n```", 4, 4)).toEqual({
      value: "",
      start: 0,
      end: 0,
    });
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
