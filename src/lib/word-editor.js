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
 * @param {import("octokit").Octokit} userOctokit 
 * @param {{ repoFullname: string, repoBranchRef: string }} forkedRepoDetails 
 * @param {{ path: string, sha: string, content: string }} word  enter new content as value to `content` property
 */
export async function editExistingWord(userOctokit, forkedRepoDetails, { path, sha, content }) {
  const { repoFullname, repoBranchRef } = forkedRepoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);
  const branch = repoBranchRef.split("/").slice(2).join("/");

  const response = await userOctokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: repoOwner,
    repo: repoName,
    branch,
    path,
    content: Buffer.from(content).toString("base64"),
    message: `word: edit commit to "${branch.split("/").at(-1)}"`,
    sha
  });

  return response.data;
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