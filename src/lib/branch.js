import { getBranch } from "./fork.js";
import { getRepoParts } from "./utils/index.js";

/**
 * 
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} repoDetails 
 * @param {string} branchName 
 */
export async function createBranch(userOctokit, repoDetails, branchName) {
  const { repoFullname, repoMainBranchRef } = repoDetails;
  const { repoName, repoOwner } = getRepoParts(repoFullname);
  const { object: { sha } } = await getBranch(userOctokit, repoFullname, repoMainBranchRef);

  const response = await userOctokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner: repoOwner,
    repo: repoName,
    ref: `refs/heads/${branchName}`,
    sha,
  });

  return response.data
}