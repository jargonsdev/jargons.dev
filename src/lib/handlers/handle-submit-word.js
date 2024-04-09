import { Octokit } from "@octokit-next/core";
import { forkRepository } from "../fork.js";
import { createBranch } from "../branch.js";
import { submitWord } from "../submit-word.js";
import { updateExistingWord } from "../word-editor.js";

/**
 * Submit Handler for word editor, handles submit function based on action
 * @param {{user: string, devJargons: string}} octokitAuths 
 * @param {"new" | "edit"} action 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} projectRepoDetails 
 * @param {{ title: string, content: string }} word 
 * 
 * @todo would be nice to have `projectRepoDetails` work directly from `constants` or `env`
 */
export default async function handleSubmitWord(octokitAuths, action, projectRepoDetails, { title, content }) {
  const userOctokit = new Octokit({ auth: octokitAuths.user });
  const devJargonsOctokit = new Octokit({ auth: octokitAuths.devJargons });

  // Fork repo
  // Create a branch for action
  // update existing word
  // submit the edit in new pr
}