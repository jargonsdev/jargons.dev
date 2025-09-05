import { describe, it, expect } from "vitest";
import {
  PROJECT_REPO_DETAILS,
  LABELS,
  SITE_META_DESCRIPTION,
  SITE_META_KEYWORDS,
  ALPHABETS,
} from "../../../constants.js";

describe("Constants Validation", () => {
  describe("PROJECT_REPO_DETAILS", () => {
    it("should have valid structure", () => {
      expect(PROJECT_REPO_DETAILS).toHaveProperty("repoFullname");
      expect(PROJECT_REPO_DETAILS).toHaveProperty("repoMainBranchRef");
      expect(typeof PROJECT_REPO_DETAILS.repoFullname).toBe("string");
      expect(typeof PROJECT_REPO_DETAILS.repoMainBranchRef).toBe("string");
    });

    it("should have valid repo fullname format", () => {
      expect(PROJECT_REPO_DETAILS.repoFullname).toMatch(/^[\w.-]+\/[\w.-]+$/);
      expect(PROJECT_REPO_DETAILS.repoFullname).toBe("jargonsdev/jargons.dev");
    });

    it("should have valid branch reference format", () => {
      expect(PROJECT_REPO_DETAILS.repoMainBranchRef).toMatch(
        /^refs\/heads\/.+/,
      );
      expect(PROJECT_REPO_DETAILS.repoMainBranchRef).toBe("refs/heads/main");
    });
  });

  describe("LABELS", () => {
    it("should have all required labels", () => {
      expect(LABELS).toHaveProperty("NEW_WORD");
      expect(LABELS).toHaveProperty("EDIT_WORD");
      expect(LABELS).toHaveProperty("VIA_EDITOR");
    });

    it("should have emoji prefixed labels", () => {
      expect(LABELS.NEW_WORD).toBe("📖new-word");
      expect(LABELS.EDIT_WORD).toBe("📖edit-word");
      expect(LABELS.VIA_EDITOR).toBe("💻via-jargons-editor");
    });

    it("should have consistent label format", () => {
      Object.values(LABELS).forEach((label) => {
        expect(typeof label).toBe("string");
        expect(label.length).toBeGreaterThan(0);
        expect(label).toMatch(/^[\p{Emoji}][\w-]+$/u);
      });
    });
  });

  describe("SITE_META_DESCRIPTION", () => {
    it("should be a non-empty string", () => {
      expect(typeof SITE_META_DESCRIPTION).toBe("string");
      expect(SITE_META_DESCRIPTION.length).toBeGreaterThan(0);
    });

    it("should be appropriate length for meta description", () => {
      // Meta descriptions should be between 120-160 characters for SEO
      expect(SITE_META_DESCRIPTION.length).toBeGreaterThan(50);
      expect(SITE_META_DESCRIPTION.length).toBeLessThan(200);
    });

    it("should contain relevant keywords", () => {
      const description = SITE_META_DESCRIPTION.toLowerCase();
      expect(description).toContain("dictionary");
      expect(description).toContain("software");
      expect(description).toContain("terms");
    });
  });

  describe("SITE_META_KEYWORDS", () => {
    it("should be an array of strings", () => {
      expect(Array.isArray(SITE_META_KEYWORDS)).toBe(true);
      expect(SITE_META_KEYWORDS.length).toBeGreaterThan(0);

      SITE_META_KEYWORDS.forEach((keyword) => {
        expect(typeof keyword).toBe("string");
        expect(keyword.length).toBeGreaterThan(0);
      });
    });

    it("should contain expected keyword categories", () => {
      const keywords = SITE_META_KEYWORDS.join(" ").toLowerCase();

      // Check for core categories
      expect(keywords).toContain("dev");
      expect(keywords).toContain("software");
      expect(keywords).toContain("dictionary");
      expect(keywords).toContain("jargon");
      expect(keywords).toContain("terms");
    });

    it("should have reasonable number of keywords", () => {
      // SEO best practice: 5-15 keywords
      expect(SITE_META_KEYWORDS.length).toBeGreaterThanOrEqual(5);
      expect(SITE_META_KEYWORDS.length).toBeLessThanOrEqual(20);
    });

    it("should not have duplicate keywords", () => {
      const uniqueKeywords = new Set(SITE_META_KEYWORDS);
      expect(uniqueKeywords.size).toBe(SITE_META_KEYWORDS.length);
    });
  });

  describe("ALPHABETS", () => {
    it("should contain all 26 letters", () => {
      expect(Array.isArray(ALPHABETS)).toBe(true);
      expect(ALPHABETS).toHaveLength(26);
    });

    it("should be in correct order", () => {
      const expectedAlphabets = "abcdefghijklmnopqrstuvwxyz".split("");
      expect(ALPHABETS).toEqual(expectedAlphabets);
    });

    it("should contain only lowercase letters", () => {
      ALPHABETS.forEach((letter) => {
        expect(typeof letter).toBe("string");
        expect(letter).toHaveLength(1);
        expect(letter).toMatch(/^[a-z]$/);
        expect(letter).toBe(letter.toLowerCase());
      });
    });

    it('should start with "a" and end with "z"', () => {
      expect(ALPHABETS[0]).toBe("a");
      expect(ALPHABETS[25]).toBe("z");
    });

    it("should not have duplicates", () => {
      const uniqueLetters = new Set(ALPHABETS);
      expect(uniqueLetters.size).toBe(26);
    });
  });

  describe("constants integrity", () => {
    it("should not have undefined or null values", () => {
      expect(PROJECT_REPO_DETAILS).toBeDefined();
      expect(PROJECT_REPO_DETAILS.repoFullname).toBeDefined();
      expect(PROJECT_REPO_DETAILS.repoMainBranchRef).toBeDefined();

      expect(LABELS).toBeDefined();
      Object.values(LABELS).forEach((label) => {
        expect(label).toBeDefined();
        expect(label).not.toBeNull();
      });

      expect(SITE_META_DESCRIPTION).toBeDefined();
      expect(SITE_META_KEYWORDS).toBeDefined();
      expect(ALPHABETS).toBeDefined();
    });

    it("should have consistent export structure", () => {
      // Ensure all expected constants are exported
      const requiredConstants = [
        "PROJECT_REPO_DETAILS",
        "LABELS",
        "SITE_META_DESCRIPTION",
        "SITE_META_KEYWORDS",
        "ALPHABETS",
      ];

      // This test ensures no constants are accidentally undefined
      expect(PROJECT_REPO_DETAILS).toBeTruthy();
      expect(LABELS).toBeTruthy();
      expect(SITE_META_DESCRIPTION).toBeTruthy();
      expect(SITE_META_KEYWORDS).toBeTruthy();
      expect(ALPHABETS).toBeTruthy();
    });
  });
});
