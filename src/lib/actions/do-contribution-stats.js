import {
  CONTENT_REPO_DETAILS,
  LABELS,
  LEGACY_CONTRIBUTION_REPO,
} from "../../../constants.js";
import app from "../octokit/app.js";
import { decrypt } from "../utils/crypto.js";
import { getBranchNameFromRef } from "../utils/index.js";

function buildContributionStatsUrl(query) {
  return `https://github.com/search?q=${encodeURIComponent(query)}&type=pullrequests`;
}

/**
 * Get some jargons contribution stats for current user on the Jargons Editor
 * @param {import("astro").AstroGlobal} astroGlobal
 */
export default async function doContributionStats(astroGlobal) {
  const { cookies } = astroGlobal;
  const { repoFullname, repoMainBranchRef } = CONTENT_REPO_DETAILS;

  const accessToken = cookies.get("jargonsdevToken", {
    decode: (value) => decrypt(value),
  });
  const userOctokit = app.getUserOctokit({ token: accessToken.value });

  // Build queries using the viewer's login and narrow to main branch if available
  const { data: me } = await userOctokit.request("GET /user");
  const viewerLogin = me?.login;

  const repositories = new Map([
    [CONTENT_REPO_DETAILS.repoFullname, CONTENT_REPO_DETAILS.repoMainBranchRef],
    [LEGACY_CONTRIBUTION_REPO, "refs/heads/main"],
  ]);
  const repositoryStats = await Promise.all(
    [...repositories].map(async ([repoFullname, repoBranchRef]) => {
      const branchInfo = getBranchNameFromRef(repoBranchRef);
      const baseQuery = `repo:${repoFullname} is:pull-request type:pr author:${viewerLogin} base:${branchInfo}`;
      const newMergedQuery = `${baseQuery} label:"${LABELS.NEW_WORD}" is:merged is:closed`;
      const editMergedQuery = `${baseQuery} label:"${LABELS.EDIT_WORD}" is:merged is:closed`;
      const pendingOpenQuery = `${baseQuery} label:"${LABELS.VIA_EDITOR}" is:open`;

      const { newMerged, editMerged, pendingOpen } = await userOctokit.graphql(
        `
        #graphql
          query ContributionStats($newMergedQuery: String!, $editMergedQuery: String!, $pendingOpenQuery: String!) {
            newMerged: search(query: $newMergedQuery, type: ISSUE, first: 1) { issueCount }
            editMerged: search(query: $editMergedQuery, type: ISSUE, first: 1) { issueCount }
            pendingOpen: search(query: $pendingOpenQuery, type: ISSUE, first: 1) { issueCount }
          }
      `,
        {
          newMergedQuery,
          editMergedQuery,
          pendingOpenQuery,
        },
      );

      return {
        newWords: newMerged?.issueCount ?? 0,
        editedWords: editMerged?.issueCount ?? 0,
        pendingWords: pendingOpen?.issueCount ?? 0,
      };
    }),
  );

  const totals = repositoryStats.reduce(
    (sum, stats) => ({
      newWords: sum.newWords + stats.newWords,
      editedWords: sum.editedWords + stats.editedWords,
      pendingWords: sum.pendingWords + stats.pendingWords,
    }),
    { newWords: 0, editedWords: 0, pendingWords: 0 },
  );

  const baseStatsUrlQuery = `org:jargonsdev is:pr author:@me base:main`;
  const newMergedSearchQuery = `${baseStatsUrlQuery} is:merged is:closed label:"${LABELS.NEW_WORD}"`;
  const editMergedSearchQuery = `${baseStatsUrlQuery} is:merged is:closed label:"${LABELS.EDIT_WORD}"`;
  const pendingOpenSearchQuery = `${baseStatsUrlQuery} is:open label:"${LABELS.VIA_EDITOR}"`;

  return {
    newWords: {
      count: totals.newWords,
      url: buildContributionStatsUrl(newMergedSearchQuery),
    },
    editedWords: {
      count: totals.editedWords,
      url: buildContributionStatsUrl(editMergedSearchQuery),
    },
    pendingWords: {
      count: totals.pendingWords,
      url: buildContributionStatsUrl(pendingOpenSearchQuery),
    },
    totalWords: {
      count: totals.newWords + totals.editedWords,
      url: buildContributionStatsUrl(
        `${baseStatsUrlQuery} is:merged is:closed label:"${LABELS.VIA_EDITOR}"`,
      ),
    },
  };
}
