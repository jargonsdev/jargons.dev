import app from "../octokit/app.js";
import { decrypt } from "../utils/crypto.js";

/**
 * Get some jargons contribution stats for current user on the Jargons Editor
 * @param {import("astro").AstroGlobal} astroGlobal 
 */
export default async function doContributionStats(astroGlobal) {
  const { cookies } = astroGlobal;

  const accessToken = cookies.get("jargons.dev:token", { decode: value => decrypt(value) });
  const userOctokit = app.getUserOctokit({ token: accessToken.value });

  // Get all New Word Contributions
  // Get all Edit Word Contributions
    // Calculate Total Contibutions
  // Get all Pending Word Contribution (both Edit and New)

  return {
    newWords: {
      count: 0,
      url: ""
    },
    editWords: {
      count: 0,
      url: ""
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