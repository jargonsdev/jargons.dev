import { getRepoParts } from "./utils/index.js";

/**
 * Create a new branch on a given repository
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} repoDetails 
 * @param {string} newBranchName 
 * @returns New Branch/Ref details
 * 
 * @todo handle error for `'Reference already exists'`
 */
export async function createBranch(userOctokit, repoDetails, newBranchName) {
  const { repoFullname, repoMainBranchRef } = repoDetails;
  const { repoName, repoOwner } = getRepoParts(repoFullname);
  const { object: { sha } } = await getBranch(userOctokit, repoFullname, repoMainBranchRef);

  try {
    const response = await userOctokit.request("POST /repos/{owner}/{repo}/git/refs", {
      owner: repoOwner,
      repo: repoName,
      ref: `refs/heads/${newBranchName}`,
      sha,
    });
  
    return response.data
  } catch (error) {
    throw new Error("error creating a new branch", error)
  }
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