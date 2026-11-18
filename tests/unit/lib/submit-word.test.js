import { describe, it, expect, beforeEach, vi } from "vitest";
import { submitWord } from "../../../src/lib/submit-word.js";
import { LABELS } from "../../../constants.js";
import {
  sampleWords,
  sampleRepoDetails,
} from "../../fixtures/test-data/index.js";

// Mock Octokit instances
const createMockOctokit = () => ({
  request: vi.fn(),
});

describe("submit-word.js", () => {
  let jargonsdevOctokit;
  let userOctokit;
  let projectRepoDetails;
  let forkedRepoDetails;

  beforeEach(() => {
    jargonsdevOctokit = createMockOctokit();
    userOctokit = createMockOctokit();
    projectRepoDetails = { ...sampleRepoDetails.project };
    forkedRepoDetails = { ...sampleRepoDetails.forked };
  });

  describe("PR Title Generation", () => {
    it("should generate correct title for new word", async () => {
      const word = sampleWords.api;

      // Mock PR creation response
      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      // Mock label addition response
      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      // Check PR creation was called with correct title
      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          title: "Dictionary (New Word): API",
        }),
      );
    });

    it("should generate correct title for word edit", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "edit",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          title: "Dictionary (Edit Word): API",
        }),
      );
    });

    it("should handle special characters in word title", async () => {
      const word = sampleWords.specialChars;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          title: "Dictionary (New Word): C++",
        }),
      );
    });

    it("should handle long word titles", async () => {
      const word = sampleWords.longTitle;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          title:
            "Dictionary (New Word): Very Long Title That Might Cause Issues With URL Generation And File Naming",
        }),
      );
    });
  });

  describe("PR Body Template Rendering", () => {
    it("should render new word template with correct substitutions", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      const callArgs = userOctokit.request.mock.calls[0][1];
      expect(callArgs.body).toContain("API");
      expect(callArgs.body).toContain("Application Programming Interface");
    });

    it("should render edit word template with correct substitutions", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "edit",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      const callArgs = userOctokit.request.mock.calls[0][1];
      expect(callArgs.body).toContain("API");
      expect(callArgs.body).toContain("Application Programming Interface");
    });

    it("should handle multiline content in template", async () => {
      const word = sampleWords.multilineContent;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      const callArgs = userOctokit.request.mock.calls[0][1];
      expect(callArgs.body).toContain("multiline content");
      expect(callArgs.body).toContain("special characters");
    });

    it("should handle empty content", async () => {
      const word = sampleWords.emptyContent;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      const callArgs = userOctokit.request.mock.calls[0][1];
      expect(callArgs.body).toContain("Empty");
    });
  });

  describe("Label Assignment Logic", () => {
    it("should assign NEW_WORD and VIA_EDITOR labels for new word", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(jargonsdevOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
        expect.objectContaining({
          labels: [LABELS.NEW_WORD, LABELS.VIA_EDITOR],
        }),
      );
    });

    it("should assign EDIT_WORD and VIA_EDITOR labels for word edit", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "edit",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(jargonsdevOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
        expect.objectContaining({
          labels: [LABELS.EDIT_WORD, LABELS.VIA_EDITOR],
        }),
      );
    });

    it("should use correct PR number for label assignment", async () => {
      const word = sampleWords.api;
      const prNumber = 789;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: prNumber },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(jargonsdevOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
        expect.objectContaining({
          issue_number: prNumber,
        }),
      );
    });
  });

  describe("Repository Details Parsing", () => {
    it("should correctly parse repository details", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          owner: "jargonsdev",
          repo: "jargons.dev",
          base: "main",
          head: "testuser:add-word-api",
        }),
      );
    });

    it("should handle complex branch references", async () => {
      const word = sampleWords.api;
      const complexForkedRepoDetails = {
        ...forkedRepoDetails,
        repoChangeBranchRef: "refs/heads/feature/add-word-api",
      };

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        complexForkedRepoDetails,
        word,
      );

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          head: "testuser:feature/add-word-api",
        }),
      );
    });

    it("should set maintainers_can_modify to true", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/pulls",
        expect.objectContaining({
          maintainers_can_modify: true,
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should propagate PR creation errors", async () => {
      const word = sampleWords.api;
      const error = new Error("API Error");

      userOctokit.request.mockRejectedValueOnce(error);

      await expect(
        submitWord(
          jargonsdevOctokit,
          userOctokit,
          "new",
          projectRepoDetails,
          forkedRepoDetails,
          word,
        ),
      ).rejects.toThrow('Error occurred while submitting word "API"');

      // Label addition should not be called if PR creation fails
      expect(jargonsdevOctokit.request).not.toHaveBeenCalled();
    });

    it("should propagate label assignment errors", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockResolvedValueOnce({
        data: { id: 123, number: 456 },
      });

      const labelError = new Error("Label Error");
      jargonsdevOctokit.request.mockRejectedValueOnce(labelError);

      await expect(
        submitWord(
          jargonsdevOctokit,
          userOctokit,
          "new",
          projectRepoDetails,
          forkedRepoDetails,
          word,
        ),
      ).rejects.toThrow('Error occurred while submitting word "API"');
    });

    it("should handle network errors", async () => {
      const word = sampleWords.api;

      userOctokit.request.mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        submitWord(
          jargonsdevOctokit,
          userOctokit,
          "new",
          projectRepoDetails,
          forkedRepoDetails,
          word,
        ),
      ).rejects.toThrow('Error occurred while submitting word "API"');
    });

    it("should handle authentication errors", async () => {
      const word = sampleWords.api;

      const authError = new Error("Bad credentials");
      authError.status = 401;
      userOctokit.request.mockRejectedValueOnce(authError);

      await expect(
        submitWord(
          jargonsdevOctokit,
          userOctokit,
          "new",
          projectRepoDetails,
          forkedRepoDetails,
          word,
        ),
      ).rejects.toThrow('Error occurred while submitting word "API"');
    });
  });

  describe("Return Value", () => {
    it("should return PR data on successful submission", async () => {
      const word = sampleWords.api;
      const prData = { id: 123, number: 456, title: "Add new word: API" };

      userOctokit.request.mockResolvedValueOnce({
        data: prData,
      });

      jargonsdevOctokit.request.mockResolvedValueOnce({
        data: [],
      });

      const result = await submitWord(
        jargonsdevOctokit,
        userOctokit,
        "new",
        projectRepoDetails,
        forkedRepoDetails,
        word,
      );

      expect(result).toEqual(prData);
    });
  });
});
