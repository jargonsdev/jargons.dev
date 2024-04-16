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
  const baseQuery = `repo:${repoFullname} is:pull-request type:pr  is:merged is:closed author:@me label:":computer: via word-editor"`;
  const baseStatsUrlQuery = `is:pr author:@me label:":computer: via word-editor"`;

  // Get all New Word Contributions
  const { data: newType } = await userOctokit.request("GET /search/issues", {
    q: `${baseQuery} label:":book: new word"`
  });

  // Get all Edit Word Contributions
  const { data: editType } = await userOctokit.request("GET /search/issues", {
    q: `${baseQuery} label:":book: edit word"`
  });

    // Calculate Total Contibutions
  // Get all Pending Word Contribution (both Edit and New)

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
      count: 0,
      url: ""
    },
    totalWords: {
      count: 0,
      url: ""
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