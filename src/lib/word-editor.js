import { getRepoParts } from "./utils/index.js";

/**
 * Write and add a new word to user's forked dictionary
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoBranchRef: string }} forkedRepoDetails 
 * @param {{ title: string, content: string }} word 
 */
export async function writeNewWord(userOctokit, forkedRepoDetails, { title, content }) {
  const { repoFullname, repoBranchRef } = forkedRepoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);
  const branch = repoBranchRef.split("/").slice(2).join("/");

  const response = await userOctokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: repoOwner,
    repo: repoName,
    branch,
    path: `src/pages/browse/${title.toLowerCase()}.mdx`,
    content: Buffer.from(content).toString("base64"),
    message: `word: commit to "${title}"`
  });

  return response.data
}

/**
 * Edit and update an existing word in user's forked dictionary
 * @param {*} userOctokit 
 * @param {{ repoFullname: string, repoBranchRef: string }} forkedRepoDetails 
 * @param {{ title: string, content: string, sha: string }} newWord
 */
export function editExistingWord(userOctokit, forkedRepoDetails, { title, content, sha }) {

}

/**
 * Retrieve data for already existing word
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoBranchRef: string }} forkedRepoDetails 
 * @param {string} wordTitle 
 */
export async function getExistingWord(userOctokit, forkedRepoDetails, wordTitle) {
  const { repoFullname, repoBranchRef } = forkedRepoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);

  const response = await userOctokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: repoOwner,
    repo: repoName,
    ref: repoBranchRef,
    path: `src/pages/browse/${wordTitle.toLowerCase()}.mdx`,
  });

  return response.data;
}