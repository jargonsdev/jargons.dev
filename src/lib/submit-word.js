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
    owner: "babblebey",
    repo: "test",
    title: "title test",
    body: "body content \n text",
    head: "sbabblebey:word/new/tuple", //`${headBranch}`, //forkedRepoDetails.repoChangeBranchRef.split("/").slice(2).join("/"),
    // head_repo: "sbabblebey/test-mm",
    base: "main"
  });

  return response.data;
}