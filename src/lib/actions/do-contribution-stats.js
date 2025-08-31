import app from "../octokit/app.js";
import { decrypt } from "../utils/crypto.js";
import { buildStatsUrl } from "../utils/index.js";
import { PROJECT_REPO_DETAILS, LABELS } from "../../../constants.js";

/**
 * Get some jargons contribution stats for current user on the Jargons Editor
 * @param {import("astro").AstroGlobal} astroGlobal
 */
export default async function doContributionStats(astroGlobal) {
  const { cookies } = astroGlobal;
  const { repoFullname, repoMainBranchRef } = PROJECT_REPO_DETAILS;

  const accessToken = cookies.get("jargonsdevToken", {
    decode: (value) => decrypt(value),
  });
  const userOctokit = app.getUserOctokit({ token: accessToken.value });

  // Build queries using the viewer's login and narrow to main branch if available
  const { data: me } = await userOctokit.request("GET /user");
  const viewerLogin = me?.login;

  const branchInfo = repoMainBranchRef ? repoMainBranchRef.split("/").slice(2).join("/") : "";

  const baseQuery = `repo:${repoFullname} is:pull-request type:pr author:${viewerLogin} base:${branchInfo}`;
  const baseStatsUrlQuery = `is:pr author:@me base:${branchInfo}`;

  const newMergedQuery = `${baseQuery} label:"${LABELS.NEW_WORD}" is:merged is:closed`;
  const editMergedQuery = `${baseQuery} label:"${LABELS.EDIT_WORD}" is:merged is:closed`;
  const pendingOpenQuery = `${baseQuery} label:"${LABELS.VIA_EDITOR}" is:open`;

  const data = await userOctokit.graphql(`
    #graphql
      query ContributionStats($newMergedQuery: String!, $editMergedQuery: String!, $pendingOpenQuery: String!) {
        newMerged: search(query: $newMergedQuery, type: ISSUE, first: 1) { issueCount }
        editMerged: search(query: $editMergedQuery, type: ISSUE, first: 1) { issueCount }
        pendingOpen: search(query: $pendingOpenQuery, type: ISSUE, first: 1) { issueCount }
      }
  `, {
    "newMergedQuery": newMergedQuery,
    "editMergedQuery": editMergedQuery,
    "pendingOpenQuery": pendingOpenQuery,
  });

  const newCount = data?.newMerged?.issueCount ?? 0;
  const editCount = data?.editMerged?.issueCount ?? 0;
  const pendingCount = data?.pendingOpen?.issueCount ?? 0;

  return {
    newWords: {
      count: newCount,
      url: buildStatsUrl(
        repoFullname,
        `${baseStatsUrlQuery} is:merged is:closed label:"${LABELS.NEW_WORD}"`
      ),
    },
    editedWords: {
      count: editCount,
      url: buildStatsUrl(
        repoFullname,
        `${baseStatsUrlQuery} is:merged is:closed label:"${LABELS.EDIT_WORD}"`
      ),
    },
    pendingWords: {
      count: pendingCount,
      url: buildStatsUrl(
        repoFullname,
        `${baseStatsUrlQuery} is:open label:"${LABELS.VIA_EDITOR}"`
      ),
    },
  };
}
