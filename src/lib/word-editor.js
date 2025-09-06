import wordFileTemplate from "./templates/word.md.js";
import { getRepoParts, normalizeAsUrl } from "./utils/index.js";

/**
 * Write and add a new word to user's forked dictionary
 * @param {import("octokit").Octokit} userOctokit
 * @param {{ repoFullname: string, repoChangeBranchRef: string }} forkedRepoDetails
 * @param {{ title: string, content: string }} word
 */
export async function writeNewWord(
  userOctokit,
  forkedRepoDetails,
  { title, content },
) {
  const { repoFullname, repoChangeBranchRef } = forkedRepoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);
  const branch = repoChangeBranchRef.split("/").slice(2).join("/");
  const wordFileContent = writeWordFileContent(title, content);

  try {
    const response = await userOctokit.request(
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        owner: repoOwner,
        repo: repoName,
        branch,
        path: `src/content/dictionary/${normalizeAsUrl(title)}.mdx`,
        content: Buffer.from(wordFileContent).toString("base64"),
        message: `word: commit to "${title}"`,
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(`Error committing new word ${title} to dictionary`, {
      cause: error,
    });
  }
}

/**
 * Update an existing word in user's forked dictionary
 * @param {import("octokit").Octokit} userOctokit
 * @param {{ repoFullname: string, repoChangeBranchRef: string }} forkedRepoDetails
 * @param {{ path: string, sha: string, title: string, content: string }} word  enter new content as value to `content` property
 */
export async function updateExistingWord(
  userOctokit,
  forkedRepoDetails,
  { path, sha, title, content },
  options,
) {
  const { repoFullname, repoChangeBranchRef } = forkedRepoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);
  const branch = repoChangeBranchRef.split("/").slice(2).join("/");
  const wordFileContent = writeWordFileContent(title, content);

  try {
    const response = await userOctokit.request(
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        owner: repoOwner,
        repo: repoName,
        branch,
        path,
        content: Buffer.from(wordFileContent).toString("base64"),
        message: `word: edit commit to "${title}"`,
        sha,
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(`Error committing edit to "${title}"`, {
      cause: error,
    });
  }
}

/**
 * Retrieve data for already existing word
 * @param {import("octokit").Octokit} userOctokit
 * @param {{ repoFullname: string, repoBranchRef: string }} repoDetails
 * @param {string} wordTitle
 */
export async function getExistingWord(userOctokit, repoDetails, wordTitle) {
  const { repoFullname, repoBranchRef } = repoDetails;
  const { repoOwner, repoName } = getRepoParts(repoFullname);

  try {
    const response = await userOctokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: repoOwner,
        repo: repoName,
        ref: repoBranchRef,
        path: `src/content/dictionary/${normalizeAsUrl(wordTitle)}.mdx`,
      },
    );

    const { content, ...responseData } = response.data;

    return {
      title: wordTitle,
      content,
      content_decoded: Buffer.from(content, "base64").toString("utf-8"),
      ...responseData,
    };
  } catch (error) {
    throw new Error(`Error getting "${wordTitle}" from dictionary`, {
      cause: error,
    });
  }
}

/**
 * Write word file content using pre-defined template
 * @param {string} title
 * @param {string} content
 * @returns {string}
 */
function writeWordFileContent(title, content) {
  const file = wordFileTemplate;
  return file.replace("$title", title).replace("$content", content);
}
