import app from "../octokit/app.js";
import { decrypt } from "../utils/crypto.js";
import { PROJECT_REPO_DETAILS } from "../../../constants.js";

/**
 * Get some jargons contribution stats for current user on the Jargons Editor
 * @param {import("astro").AstroGlobal} astroGlobal 
 */
export default async function doContributionStats(astroGlobal) {
  const { cookies } = astroGlobal;
  const { repoFullname, repoMainBranchRef } = PROJECT_REPO_DETAILS; 

  const accessToken = cookies.get("jargons.dev:token", { decode: value => decrypt(value) });
  const userOctokit = app.getUserOctokit({ token: accessToken.value });

  /**
   * @todo Implement narrowed search to project's main branch 
   */
  const baseQuery = `repo:${repoFullname} is:pull-request type:pr author:@me`;
  const baseStatsUrlQuery = `is:pr author:@me`;

  /**
   * @todo [thoughts]: would be nice to have all these requests in one, and use a filter to separate by labels
   * [potential bottleneck]: no wat to know whether a PR is "merged" considering that "closed" doesn't mean merged
   */
  const { data: newType } = await userOctokit.request("GET /search/issues", {
    q: `${baseQuery} label:":book: new word" is:merged is:closed`
  });
  const { data: editType } = await userOctokit.request("GET /search/issues", {
    q: `${baseQuery} label:":book: edit word" is:merged is:closed`
  });
  const { data: pendingType } = await userOctokit.request("GET /search/issues", {
    q: `${baseQuery} label:":book: edit word",":book: new word" is:unmerged is:open`
  });

  return {
    newWords: {
      count: newType.total_count,
      url: buildStatsUrl(repoFullname, `${baseStatsUrlQuery} is:merged is:closed label:":book: new word"`)
    },
    editedWords: {
      count: editType.total_count,
      url: buildStatsUrl(repoFullname, `${baseStatsUrlQuery} is:merged is:closed label:":book: edit word"`)
    },
    pendingWords: {
      count: pendingType.total_count,
      url: buildStatsUrl(repoFullname, `${baseStatsUrlQuery} is:unmerged is:open`)
    }
  }
}

/**
 * Build URL to the Pull Request list on the project's Repo
 * @param {string} repoFullname 
 * @param {string} queryString 
 * @returns {string}
 */
function buildStatsUrl(repoFullname, queryString) {
  return `https://github.com/${repoFullname}/pulls?q=${encodeURIComponent(queryString)}`;
}