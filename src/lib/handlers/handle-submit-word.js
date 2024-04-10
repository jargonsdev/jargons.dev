import { Octokit } from "@octokit-next/core";
import { forkRepository } from "../fork.js";
import { createBranch } from "../branch.js";
import { submitWord } from "../submit-word.js";
import { normalizeAsUrl } from "../utils/index.js";
import { updateExistingWord } from "../word-editor.js";

/**
 * Submit Handler for word editor, handles submit function based on action
 * @param {{user: string, devJargons: string}} octokitAuths 
 * @param {"new" | "edit"} action 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} projectRepoDetails 
 * @param {{ title: string, content: string, metadata: object }} word 
 * 
 * @todo would be nice to have `projectRepoDetails` work directly from `constants` or `env`
 */
export default async function handleSubmitWord(octokitAuths, action, projectRepoDetails, { title, content, metadata }) {
  const userOctokit = new Octokit({ auth: octokitAuths.user });
  const devJargonsOctokit = new Octokit({ auth: octokitAuths.devJargons });

  console.log(octokitAuths);
  console.log(metadata);

  // Fork repo
  const fork = await forkRepository(userOctokit, projectRepoDetails);
  console.log("Project Fork: ", fork);

  // Create a branch for action
  const branch = await createBranch(
    userOctokit, 
    {
      repoFullname: fork,
      repoMainBranchRef: projectRepoDetails.repoMainBranchRef
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
    projectRepoDetails, 
    forkedRepoDetails, 
    {
      title, 
      content
    }
  );
  console.log("Word submitted: ", wordSubmission);
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