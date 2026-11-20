import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/lib/octokit/app.js", () => ({
  default: {
    getUserOctokit: vi.fn(),
  },
}));

import app from "../../../src/lib/octokit/app.js";
import doContributionStats from "../../../src/lib/actions/do-contribution-stats.js";

describe("doContributionStats", () => {
  let userOctokit;

  beforeEach(() => {
    vi.clearAllMocks();
    userOctokit = {
      request: vi.fn().mockResolvedValue({ data: { login: "contributor" } }),
      graphql: vi.fn(async (_query, variables) => {
        if (variables.newMergedQuery.includes("repo:jargonsdev/content")) {
          return {
            newMerged: { issueCount: 2 },
            editMerged: { issueCount: 3 },
            pendingOpen: { issueCount: 4 },
          };
        }

        return {
          newMerged: { issueCount: 5 },
          editMerged: { issueCount: 6 },
          pendingOpen: { issueCount: 7 },
        };
      }),
    };
    app.getUserOctokit.mockReturnValue(userOctokit);
  });

  it("includes historical app-repository contributions in the totals", async () => {
    const stats = await doContributionStats({
      cookies: { get: () => ({ value: "oauth-token" }) },
    });

    expect(stats.newWords.count).toBe(7);
    expect(stats.editedWords.count).toBe(9);
    expect(stats.pendingWords.count).toBe(11);
    expect(stats.totalWords.count).toBe(16);
    expect(userOctokit.graphql).toHaveBeenCalledTimes(2);

    const repoQueries = userOctokit.graphql.mock.calls.map(
      ([, variables]) => variables.newMergedQuery,
    );
    expect(repoQueries).toEqual(
      expect.arrayContaining([
        expect.stringContaining("repo:jargonsdev/content"),
        expect.stringContaining("repo:jargonsdev/jargons.dev"),
      ]),
    );

    const searchQuery = new URL(stats.newWords.url).searchParams.get("q");
    expect(searchQuery).toContain("org:jargonsdev");
    expect(searchQuery).toContain('label:"📖new-word"');
  });
});
