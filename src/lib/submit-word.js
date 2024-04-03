import { getRepoParts } from "./utils/index.js";

/**
 * 
 * @param {import("octokit").Octokit} userOctokit 
 * @param {"new" | "edit"} action 
 * @param {{ repoFullname: string, repoBranchRef: string }} mainRepoDetails 
 * @param {{ repoFullname: string, repoChangeBranchRef: string }} forkedRepoDetails 
 * @param {{ title: string, content: string }} word 
 */
export async function submitWord(userOctokit, action, mainRepoDetails, forkedRepoDetails, word) {
  const { repoFullname, repoBranchRef: mainRepoBranchRef } = mainRepoDetails;
  const { repoName, repoOwner } = getRepoParts(repoFullname);
  const { repoOwner: forkedRepoOwner } = getRepoParts(forkedRepoDetails.repoFullname);
  const baseBranch = mainRepoBranchRef.split("/").slice(2).join("/");
  const headBranch = forkedRepoDetails.repoChangeBranchRef.split("/").slice(2).join("/");

  const response = await userOctokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner: repoOwner,
    repo: repoName,
    head: `${forkedRepoOwner}:${headBranch}`,
    base: baseBranch,
    title: "title test", // word.title
    body: "body content \ntext", // word.content
  });

  return response.data;
}