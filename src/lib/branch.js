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

/**
 * Get a Branch/Ref details
 * @param {import("octokit").Octokit} userOctokit 
 * @param {string} repo 
 * @param {string} ref 
 * @returns Branch/Ref details
 */
export async function getBranch(userOctokit, repo, ref) {
  const { repoOwner, repoName } = getRepoParts(repo);

  const response = await userOctokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner: repoOwner,
    repo: repoName,
    ref: ref,
  });

  return response.data;
}