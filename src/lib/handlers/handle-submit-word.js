import { Octokit } from "@octokit-next/core";
import { forkRepository } from "../fork.js";
import { createBranch } from "../branch.js";
import { submitWord } from "../submit-word.js";
import { normalizeAsUrl } from "../utils/index.js";
import { updateExistingWord } from "../word-editor.js";
import { PROJECT_REPO_DETAILS } from "../../../constants.js";

/**
 * Submit Handler for word editor, handles submit function based on action
 * @param {{user: string, devJargons: string}} octokitAuths 
 * @param {"new" | "edit"} action 
 * @param {{ title: string, content: string, metadata: object }} word 
 * 
 * @todo add error handling
 * @todo BUG: address `octokitAuths.devJargons` turns a bad credential after seom time
 * @todo add a logic that checks whether there's a change existing word - if not? Don't do any submit
 */
export default async function handleSubmitWord(octokitAuths, action, { title, content, metadata }) {
  const userOctokit = new Octokit({ auth: octokitAuths.user });
  const devJargonsOctokit = new Octokit({ auth: octokitAuths.devJargons });

  // Fork repo
  const fork = await forkRepository(userOctokit, PROJECT_REPO_DETAILS);
  console.log("Project Fork: ", fork);

  // Create a branch for action
  const branch = await createBranch(
    userOctokit, 
    {
      repoFullname: fork,
      repoMainBranchRef: PROJECT_REPO_DETAILS.repoMainBranchRef
    },
    generateBranchName(action, title)
  );
  console.log("Branch Created: ", branch);

  const forkedRepoDetails = {
    repoFullname: fork,
    repoChangeBranchRef: branch.ref
  }
  
  // update existing word
  const word = await updateExistingWord(userOctokit, forkedRepoDetails, {
    title,
    content,
    path: metadata.path,
    sha: metadata.sha
  }, {
    env: "browser"
  });
  console.log("Word updated: ", word);

  // submit the edit in new pr
  const wordSubmission = await submitWord(
    devJargonsOctokit, 
    userOctokit, 
    action, 
    PROJECT_REPO_DETAILS, 
    forkedRepoDetails, 
    {
      title, 
      content
    }
  );
  console.log("Word submitted: ", wordSubmission);

  return wordSubmission;
}

/**
 * Generate branch name
 * @param {string} action 
 * @param {string} wordTitle 
 * @returns {string}
 */
function generateBranchName(action, wordTitle) {
  return `word/${action}/${normalizeAsUrl(wordTitle)}`;
}