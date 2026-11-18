import { describe, it, expect, beforeEach, vi } from "vitest";
import { forkRepository } from "../../../src/lib/fork.js";
import { sampleRepoDetails } from "../../fixtures/test-data/index.js";

// Mock the branch.js module
vi.mock("../../../src/lib/branch.js", () => ({
  getBranch: vi.fn(),
}));

import { getBranch } from "../../../src/lib/branch.js";

// Mock Octokit instance
const createMockOctokit = () => ({
  request: vi.fn(),
  graphql: vi.fn(),
});

describe("fork.js", () => {
  let userOctokit;
  let projectRepoDetails;

  beforeEach(() => {
    userOctokit = createMockOctokit();
    projectRepoDetails = { ...sampleRepoDetails.project };
    vi.clearAllMocks();
  });

  describe("forkRepository", () => {
    it("should create new fork when repository is not already forked", async () => {
      const userData = { login: "testuser", id: 12345 };
      const newForkData = {
        full_name: "testuser/jargons.dev",
        name: "jargons.dev",
        owner: { login: "testuser" },
      };

      // Mock user data
      userOctokit.request.mockResolvedValueOnce({
        data: userData,
      });

      // Mock isRepositoryForked (no existing fork)
      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [],
          },
        },
      });

      // Mock fork creation
      userOctokit.request.mockResolvedValueOnce({
        data: newForkData,
      });

      const result = await forkRepository(userOctokit, projectRepoDetails);

      expect(userOctokit.request).toHaveBeenNthCalledWith(1, "GET /user");

      expect(userOctokit.graphql).toHaveBeenCalledWith(
        expect.stringContaining("query forks"),
        { login: "testuser" },
      );

      expect(userOctokit.request).toHaveBeenNthCalledWith(
        2,
        "POST /repos/{owner}/{repo}/forks",
        {
          owner: "jargonsdev",
          repo: "jargons.dev",
          default_branch_only: true,
        },
      );

      expect(result).toBe("testuser/jargons.dev");
    });

    it("should return existing fork when repository is already forked and up-to-date", async () => {
      const userData = { login: "testuser", id: 12345 };
      const existingFork = "testuser/jargons.dev";
      const mainBranchSha = "same-sha-123";

      // Mock user data
      userOctokit.request.mockResolvedValueOnce({
        data: userData,
      });

      // Mock isRepositoryForked (existing fork found)
      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "jargons.dev",
                owner: { login: "testuser" },
                parent: {
                  name: "jargons.dev",
                  owner: { login: "jargonsdev" },
                },
              },
            ],
          },
        },
      });

      // Mock getBranch calls for sync check (up-to-date)
      getBranch
        .mockResolvedValueOnce({
          object: { sha: mainBranchSha },
          ref: "refs/heads/main",
        })
        .mockResolvedValueOnce({
          object: { sha: mainBranchSha },
          ref: "refs/heads/main",
        });

      const result = await forkRepository(userOctokit, projectRepoDetails);

      expect(getBranch).toHaveBeenCalledTimes(2);
      expect(getBranch).toHaveBeenNthCalledWith(
        1,
        userOctokit,
        existingFork,
        "refs/heads/main",
      );
      expect(getBranch).toHaveBeenNthCalledWith(
        2,
        userOctokit,
        "jargonsdev/jargons.dev",
        "refs/heads/main",
      );

      expect(result).toBe(existingFork);
    });

    it("should update existing fork when repository is already forked but outdated", async () => {
      const userData = { login: "testuser", id: 12345 };
      const existingFork = "testuser/jargons.dev";
      const outdatedSha = "old-sha-123";
      const latestSha = "new-sha-456";

      // Mock user data
      userOctokit.request.mockResolvedValueOnce({
        data: userData,
      });

      // Mock isRepositoryForked (existing fork found)
      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "jargons.dev",
                owner: { login: "testuser" },
                parent: {
                  name: "jargons.dev",
                  owner: { login: "jargonsdev" },
                },
              },
            ],
          },
        },
      });

      // Mock getBranch calls for sync check (outdated)
      getBranch
        .mockResolvedValueOnce({
          object: { sha: outdatedSha },
          ref: "refs/heads/main",
        })
        .mockResolvedValueOnce({
          object: { sha: latestSha },
          ref: "refs/heads/main",
        });

      // Mock fork update using merge-upstream
      userOctokit.request.mockResolvedValueOnce({
        data: {
          message: "Successfully fetched and fast-forwarded from upstream.",
          merge_type: "fast-forward",
          base_branch: "main",
        },
      });

      const result = await forkRepository(userOctokit, projectRepoDetails);

      expect(userOctokit.request).toHaveBeenNthCalledWith(
        2,
        "POST /repos/{owner}/{repo}/merge-upstream",
        {
          owner: "testuser",
          repo: "jargons.dev",
          branch: "main",
        },
      );

      expect(result).toBe(existingFork);
    });

    it("should handle repository details parsing correctly", async () => {
      const customRepoDetails = {
        repoFullname: "organization/custom-project",
        repoMainBranchRef: "refs/heads/development",
      };

      const userData = { login: "testuser", id: 12345 };

      userOctokit.request.mockResolvedValueOnce({
        data: userData,
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: { repositories: { nodes: [] } },
      });

      userOctokit.request.mockResolvedValueOnce({
        data: { full_name: "testuser/custom-project" },
      });

      await forkRepository(userOctokit, customRepoDetails);

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/forks",
        expect.objectContaining({
          owner: "organization",
          repo: "custom-project",
        }),
      );
    });

    it("should handle multiple existing forks and find correct match", async () => {
      const userData = { login: "testuser", id: 12345 };

      userOctokit.request.mockResolvedValueOnce({
        data: userData,
      });

      // Mock multiple forks, with one matching our target repo
      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "other-project",
                owner: { login: "testuser" },
                parent: {
                  name: "other-project",
                  owner: { login: "someowner" },
                },
              },
              {
                name: "jargons.dev",
                owner: { login: "testuser" },
                parent: {
                  name: "jargons.dev",
                  owner: { login: "jargonsdev" },
                },
              },
            ],
          },
        },
      });

      getBranch
        .mockResolvedValueOnce({
          object: { sha: "same-sha" },
        })
        .mockResolvedValueOnce({
          object: { sha: "same-sha" },
        });

      const result = await forkRepository(userOctokit, projectRepoDetails);

      expect(result).toBe("testuser/jargons.dev");
    });

    it("should handle complex branch reference formats during sync", async () => {
      const customRepoDetails = {
        repoFullname: "owner/repo",
        repoMainBranchRef: "refs/heads/feature/main-branch",
      };

      const userData = { login: "testuser", id: 12345 };

      userOctokit.request.mockResolvedValueOnce({
        data: userData,
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "repo",
                owner: { login: "testuser" },
                parent: {
                  name: "repo",
                  owner: { login: "owner" },
                },
              },
            ],
          },
        },
      });

      getBranch
        .mockResolvedValueOnce({
          object: { sha: "old-sha" },
        })
        .mockResolvedValueOnce({
          object: { sha: "new-sha" },
        });

      userOctokit.request.mockResolvedValueOnce({
        data: {
          message: "Successfully fetched and fast-forwarded from upstream.",
          merge_type: "fast-forward",
          base_branch: "feature/main-branch",
        },
      });

      await forkRepository(userOctokit, customRepoDetails);

      expect(userOctokit.request).toHaveBeenCalledWith(
        "POST /repos/{owner}/{repo}/merge-upstream",
        expect.objectContaining({
          branch: "feature/main-branch",
        }),
      );
    });

    it("should throw wrapped error on user data fetch failure", async () => {
      userOctokit.request.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(
        forkRepository(userOctokit, projectRepoDetails),
      ).rejects.toThrow("Error occurred while forking repository");
    });

    it("should throw wrapped error on GraphQL query failure", async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { login: "testuser" },
      });

      userOctokit.graphql.mockRejectedValueOnce(new Error("GraphQL Error"));

      await expect(
        forkRepository(userOctokit, projectRepoDetails),
      ).rejects.toThrow("Error occurred while forking repository");
    });

    it("should throw wrapped error on fork creation failure", async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { login: "testuser" },
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: { repositories: { nodes: [] } },
      });

      userOctokit.request.mockRejectedValueOnce(
        new Error("Fork creation failed"),
      );

      await expect(
        forkRepository(userOctokit, projectRepoDetails),
      ).rejects.toThrow("Error occurred while forking repository");
    });

    it("should throw wrapped error on sync status check failure", async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { login: "testuser" },
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "jargons.dev",
                owner: { login: "testuser" },
                parent: {
                  name: "jargons.dev",
                  owner: { login: "jargonsdev" },
                },
              },
            ],
          },
        },
      });

      getBranch.mockRejectedValueOnce(new Error("Branch not found"));

      await expect(
        forkRepository(userOctokit, projectRepoDetails),
      ).rejects.toThrow("Error occurred while forking repository");
    });

    it("should propagate sync update errors", async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { login: "testuser" },
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "jargons.dev",
                owner: { login: "testuser" },
                parent: {
                  name: "jargons.dev",
                  owner: { login: "jargonsdev" },
                },
              },
            ],
          },
        },
      });

      getBranch
        .mockResolvedValueOnce({
          object: { sha: "old-sha" },
        })
        .mockResolvedValueOnce({
          object: { sha: "new-sha" },
        });

      userOctokit.request.mockRejectedValueOnce(new Error("Update failed"));

      await expect(
        forkRepository(userOctokit, projectRepoDetails),
      ).rejects.toThrow("Error occurred while forking repository");
    });
  });

  describe("GraphQL Query Structure", () => {
    it("should use correct GraphQL query for checking forks", async () => {
      const userData = { login: "testuser", id: 12345 };

      userOctokit.request.mockResolvedValueOnce({
        data: userData,
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: { repositories: { nodes: [] } },
      });

      userOctokit.request.mockResolvedValueOnce({
        data: { full_name: "testuser/jargons.dev" },
      });

      await forkRepository(userOctokit, projectRepoDetails);

      expect(userOctokit.graphql).toHaveBeenCalledWith(
        expect.stringContaining("query forks"),
        { login: "testuser" },
      );

      const graphqlCall = userOctokit.graphql.mock.calls[0];
      const query = graphqlCall[0];

      expect(query).toContain("user (login: $login)");
      expect(query).toContain("repositories(first: 100, isFork: true)");
      expect(query).toContain("parent");
    });

    it("should handle empty GraphQL response", async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { login: "testuser" },
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [],
          },
        },
      });

      userOctokit.request.mockResolvedValueOnce({
        data: { full_name: "testuser/jargons.dev" },
      });

      const result = await forkRepository(userOctokit, projectRepoDetails);

      expect(result).toBe("testuser/jargons.dev");
    });

    it("should handle null parent in GraphQL response", async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { login: "testuser" },
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "not-a-fork",
                owner: { login: "testuser" },
                parent: null,
              },
            ],
          },
        },
      });

      userOctokit.request.mockResolvedValueOnce({
        data: { full_name: "testuser/jargons.dev" },
      });

      const result = await forkRepository(userOctokit, projectRepoDetails);

      expect(result).toBe("testuser/jargons.dev");
    });
  });

  describe("Error Propagation", () => {
    it("should preserve original error information in main wrapper", async () => {
      const originalError = new Error("API Rate Limit Exceeded");
      originalError.status = 403;
      originalError.response = { data: { message: "Rate limited" } };

      userOctokit.request.mockRejectedValueOnce(originalError);

      try {
        await forkRepository(userOctokit, projectRepoDetails);
      } catch (error) {
        expect(error.message).toBe("Error occurred while forking repository");
        expect(error.cause).toBe(originalError);
      }
    });

    it("should preserve error information from getBranch calls", async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { login: "testuser" },
      });

      userOctokit.graphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: "jargons.dev",
                owner: { login: "testuser" },
                parent: {
                  name: "jargons.dev",
                  owner: { login: "jargonsdev" },
                },
              },
            ],
          },
        },
      });

      const branchError = new Error("Branch access denied");
      branchError.status = 403;
      getBranch.mockRejectedValueOnce(branchError);

      try {
        await forkRepository(userOctokit, projectRepoDetails);
      } catch (error) {
        expect(error.message).toBe("Error occurred while forking repository");
        expect(error.cause.message).toBe(
          "Error occurred while checking fork update status",
        );
        expect(error.cause.cause).toBe(branchError);
      }
    });
  });
});
