import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createBranch,
  getBranch,
  deleteBranch,
} from "../../../src/lib/branch.js";

// Mock Octokit instance
const createMockOctokit = () => ({
  request: vi.fn(),
});

describe("branch.js", () => {
  let userOctokit;
  let repoDetails;

  beforeEach(() => {
    userOctokit = createMockOctokit();
    repoDetails = {
      repoFullname: "testuser/jargons.dev",
      repoMainBranchRef: "refs/heads/main",
    };
  });

  describe("createBranch", () => {
    it("should create new branch with correct parameters", async () => {
      const newBranchName = "feature/new-word";
      const mainBranchSha = "abc123def456";

      // Mock getBranch call (used internally by createBranch)
      userOctokit.request
        .mockResolvedValueOnce({
          data: {
            object: { sha: mainBranchSha },
            ref: "refs/heads/main",
            url: "https://api.github.com/repos/testuser/jargons.dev/git/refs/heads/main",
          },
        })
        .mockResolvedValueOnce({
          data: {
            ref: `refs/heads/${newBranchName}`,
            object: { sha: mainBranchSha },
          },
        });

      const result = await createBranch(
        userOctokit,
        repoDetails,
        newBranchName,
      );

      // Should first get the main branch to get its SHA
      expect(userOctokit.request).toHaveBeenNthCalledWith(
        1,
        "GET /repos/{owner}/{repo}/git/ref/{ref}",
        {
          owner: "testuser",
          repo: "jargons.dev",
          ref: "heads/main",
        },
      );

      // Then create the new branch
      expect(userOctokit.request).toHaveBeenNthCalledWith(
        2,
        "POST /repos/{owner}/{repo}/git/refs",
        {
          owner: "testuser",
          repo: "jargons.dev",
          ref: `refs/heads/${newBranchName}`,
          sha: mainBranchSha,
        },
      );

      expect(result).toEqual({
        ref: `refs/heads/${newBranchName}`,
        object: { sha: mainBranchSha },
      });
    });

    it("should handle repository details parsing correctly", async () => {
      const customRepoDetails = {
        repoFullname: "user/custom-repo",
        repoMainBranchRef: "refs/heads/development",
      };
      const newBranchName = "fix/bug-123";

      userOctokit.request
        .mockResolvedValueOnce({
          data: { object: { sha: "sha123" } },
        })
        .mockResolvedValueOnce({
          data: { ref: `refs/heads/${newBranchName}` },
        });

      await createBranch(userOctokit, customRepoDetails, newBranchName);

      expect(userOctokit.request).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          owner: "user",
          repo: "custom-repo",
        }),
      );
    });

    it("should handle different branch reference formats", async () => {
      const customRepoDetails = {
        repoFullname: "testuser/jargons.dev",
        repoMainBranchRef: "refs/heads/feature/base-branch",
      };

      userOctokit.request
        .mockResolvedValueOnce({
          data: { object: { sha: "sha456" } },
        })
        .mockResolvedValueOnce({
          data: { ref: "refs/heads/new-feature" },
        });

      await createBranch(userOctokit, customRepoDetails, "new-feature");

      expect(userOctokit.request).toHaveBeenNthCalledWith(
        1,
        "GET /repos/{owner}/{repo}/git/ref/{ref}",
        expect.objectContaining({
          ref: "heads/feature/base-branch",
        }),
      );
    });

    it("should throw wrapped error on branch creation failure", async () => {
      userOctokit.request
        .mockResolvedValueOnce({
          data: { object: { sha: "sha789" } },
        })
        .mockRejectedValueOnce(new Error("Reference already exists"));

      await expect(
        createBranch(userOctokit, repoDetails, "existing-branch"),
      ).rejects.toThrow("Error occurred while creating new branch");
    });

    it("should throw wrapped error on getBranch failure", async () => {
      userOctokit.request.mockRejectedValueOnce(new Error("Branch not found"));

      await expect(
        createBranch(userOctokit, repoDetails, "any-branch"),
      ).rejects.toThrow("Error occurred while getting branch");
    });

    it("should handle special characters in branch names", async () => {
      const branchName = "feature/word-c++";

      userOctokit.request
        .mockResolvedValueOnce({
          data: { object: { sha: "sha999" } },
        })
        .mockResolvedValueOnce({
          data: { ref: `refs/heads/${branchName}` },
        });

      await createBranch(userOctokit, repoDetails, branchName);

      expect(userOctokit.request).toHaveBeenNthCalledWith(
        2,
        "POST /repos/{owner}/{repo}/git/refs",
        expect.objectContaining({
          ref: `refs/heads/${branchName}`,
        }),
      );
    });
  });

  describe("getBranch", () => {
    it("should get branch with full ref format", async () => {
      const fullRef = "refs/heads/main";
      const repoFullname = "testuser/jargons.dev";

      userOctokit.request.mockResolvedValueOnce({
        data: {
          ref: fullRef,
          object: { sha: "branch-sha-123" },
          url: "https://api.github.com/repos/testuser/jargons.dev/git/refs/heads/main",
        },
      });

      const result = await getBranch(userOctokit, repoFullname, fullRef);

      expect(userOctokit.request).toHaveBeenCalledWith(
        "GET /repos/{owner}/{repo}/git/ref/{ref}",
        {
          owner: "testuser",
          repo: "jargons.dev",
          ref: "heads/main",
        },
      );

      expect(result).toEqual({
        ref: fullRef,
        object: { sha: "branch-sha-123" },
        url: expect.any(String),
      });
    });

    it("should get branch with short ref format", async () => {
      const shortRef = "feature-branch";
      const repoFullname = "user/repo";

      userOctokit.request.mockResolvedValueOnce({
        data: {
          ref: `refs/heads/${shortRef}`,
          object: { sha: "short-ref-sha" },
        },
      });

      await getBranch(userOctokit, repoFullname, shortRef);

      expect(userOctokit.request).toHaveBeenCalledWith(
        "GET /repos/{owner}/{repo}/git/ref/{ref}",
        {
          owner: "user",
          repo: "repo",
          ref: shortRef,
        },
      );
    });

    it("should handle complex branch reference formats", async () => {
      const complexRef = "refs/heads/feature/complex/branch/name";
      const repoFullname = "owner/repository";

      userOctokit.request.mockResolvedValueOnce({
        data: {
          ref: complexRef,
          object: { sha: "complex-sha" },
        },
      });

      await getBranch(userOctokit, repoFullname, complexRef);

      expect(userOctokit.request).toHaveBeenCalledWith(
        "GET /repos/{owner}/{repo}/git/ref/{ref}",
        {
          owner: "owner",
          repo: "repository",
          ref: "heads/feature/complex/branch/name",
        },
      );
    });

    it("should parse repository fullname correctly", async () => {
      const repoFullname = "organization/project-name";
      const ref = "main";

      userOctokit.request.mockResolvedValueOnce({
        data: { ref: "refs/heads/main", object: { sha: "main-sha" } },
      });

      await getBranch(userOctokit, repoFullname, ref);

      expect(userOctokit.request).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          owner: "organization",
          repo: "project-name",
        }),
      );
    });

    it("should throw wrapped error on API failure", async () => {
      const repoFullname = "user/repo";
      const ref = "nonexistent-branch";

      userOctokit.request.mockRejectedValueOnce(new Error("Not Found"));

      await expect(getBranch(userOctokit, repoFullname, ref)).rejects.toThrow(
        "Error occurred while getting branch nonexistent-branch",
      );
    });

    it("should handle permission errors", async () => {
      const repoFullname = "private/repo";
      const ref = "secure-branch";

      const permissionError = new Error("Forbidden");
      permissionError.status = 403;
      userOctokit.request.mockRejectedValueOnce(permissionError);

      await expect(getBranch(userOctokit, repoFullname, ref)).rejects.toThrow(
        "Error occurred while getting branch secure-branch",
      );
    });
  });

  describe("deleteBranch", () => {
    it("should delete branch with correct parameters", async () => {
      const repoFullname = "testuser/jargons.dev";
      const branchName = "feature/delete-me";

      userOctokit.request.mockResolvedValueOnce({
        status: 204,
      });

      const result = await deleteBranch(userOctokit, repoFullname, branchName);

      expect(userOctokit.request).toHaveBeenCalledWith(
        "DELETE /repos/{owner}/{repo}/git/refs/{ref}",
        {
          owner: "testuser",
          repo: "jargons.dev",
          ref: `heads/${branchName}`,
        },
      );

      expect(result).toBe(204);
    });

    it("should handle complex branch names", async () => {
      const repoFullname = "user/project";
      const branchName = "feature/complex/branch/structure";

      userOctokit.request.mockResolvedValueOnce({
        status: 204,
      });

      await deleteBranch(userOctokit, repoFullname, branchName);

      expect(userOctokit.request).toHaveBeenCalledWith(
        "DELETE /repos/{owner}/{repo}/git/refs/{ref}",
        expect.objectContaining({
          ref: `heads/${branchName}`,
        }),
      );
    });

    it("should parse repository details correctly", async () => {
      const repoFullname = "organization/repository-name";
      const branchName = "temp-branch";

      userOctokit.request.mockResolvedValueOnce({
        status: 204,
      });

      await deleteBranch(userOctokit, repoFullname, branchName);

      expect(userOctokit.request).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          owner: "organization",
          repo: "repository-name",
        }),
      );
    });

    it("should handle special characters in branch names", async () => {
      const repoFullname = "user/repo";
      const branchName = "word/c++-definition";

      userOctokit.request.mockResolvedValueOnce({
        status: 204,
      });

      await deleteBranch(userOctokit, repoFullname, branchName);

      expect(userOctokit.request).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ref: `heads/${branchName}`,
        }),
      );
    });

    it("should throw wrapped error on deletion failure", async () => {
      const repoFullname = "user/repo";
      const branchName = "protected-branch";

      const deleteError = new Error("Branch is protected");
      userOctokit.request.mockRejectedValueOnce(deleteError);

      await expect(
        deleteBranch(userOctokit, repoFullname, branchName),
      ).rejects.toThrow("Error occurred while deleting branch");
    });

    it("should handle not found errors", async () => {
      const repoFullname = "user/repo";
      const branchName = "already-deleted";

      const notFoundError = new Error("Reference does not exist");
      notFoundError.status = 422;
      userOctokit.request.mockRejectedValueOnce(notFoundError);

      await expect(
        deleteBranch(userOctokit, repoFullname, branchName),
      ).rejects.toThrow("Error occurred while deleting branch");
    });

    it("should return status code on successful deletion", async () => {
      const repoFullname = "user/repo";
      const branchName = "success-delete";

      userOctokit.request.mockResolvedValueOnce({
        status: 204,
        data: null,
      });

      const result = await deleteBranch(userOctokit, repoFullname, branchName);

      expect(result).toBe(204);
    });
  });

  describe("Branch Reference Handling", () => {
    it("should correctly format refs in getBranch for different input formats", async () => {
      const testCases = [
        { input: "refs/heads/main", expected: "heads/main" },
        { input: "refs/heads/feature/test", expected: "heads/feature/test" },
        { input: "main", expected: "main" },
        { input: "feature-branch", expected: "feature-branch" },
      ];

      for (const testCase of testCases) {
        userOctokit.request.mockResolvedValueOnce({
          data: { ref: testCase.input, object: { sha: "test-sha" } },
        });

        await getBranch(userOctokit, "user/repo", testCase.input);

        expect(userOctokit.request).toHaveBeenLastCalledWith(
          "GET /repos/{owner}/{repo}/git/ref/{ref}",
          expect.objectContaining({
            ref: testCase.expected,
          }),
        );
      }
    });

    it("should handle edge cases in ref formatting", async () => {
      const edgeCases = [
        "refs/heads/",
        "refs/heads/refs/heads/double-refs",
        "refs/heads/with/multiple/slashes",
      ];

      for (const ref of edgeCases) {
        userOctokit.request.mockResolvedValueOnce({
          data: { ref, object: { sha: "edge-sha" } },
        });

        await getBranch(userOctokit, "user/repo", ref);

        expect(userOctokit.request).toHaveBeenCalled();
        userOctokit.request.mockClear();
      }
    });
  });

  describe("Error Propagation", () => {
    it("should preserve original error information in createBranch", async () => {
      const originalError = new Error("Validation Failed");
      originalError.status = 422;
      originalError.response = {
        data: { message: "Reference already exists" },
      };

      userOctokit.request
        .mockResolvedValueOnce({ data: { object: { sha: "sha" } } })
        .mockRejectedValueOnce(originalError);

      try {
        await createBranch(userOctokit, repoDetails, "duplicate-branch");
      } catch (error) {
        expect(error.message).toBe("Error occurred while creating new branch");
        expect(error.cause).toBe(originalError);
      }
    });

    it("should preserve original error information in getBranch", async () => {
      const originalError = new Error("Not Found");
      originalError.status = 404;

      userOctokit.request.mockRejectedValueOnce(originalError);

      try {
        await getBranch(userOctokit, "user/repo", "missing-branch");
      } catch (error) {
        expect(error.message).toBe(
          "Error occurred while getting branch missing-branch",
        );
        expect(error.cause).toBe(originalError);
      }
    });

    it("should preserve original error information in deleteBranch", async () => {
      const originalError = new Error("Forbidden");
      originalError.status = 403;

      userOctokit.request.mockRejectedValueOnce(originalError);

      try {
        await deleteBranch(userOctokit, "user/repo", "protected-branch");
      } catch (error) {
        expect(error.message).toBe("Error occurred while deleting branch");
        expect(error.cause).toBe(originalError);
      }
    });
  });
});
