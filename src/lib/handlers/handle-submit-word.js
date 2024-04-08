import { forkRepository } from "../fork.js";
import { createBranch } from "../branch.js";
import { submitWord } from "../submit-word.js";
import { updateExistingWord } from "../word-editor.js";

/**
 * Submit Handler for word editor, handles submit function based on action
 * @param {"new" | "edit"} action 
 * @param {{ title: string, content: string }} word 
 */
export default function handleSubmitWord(devJargonsOctokit, userOctokit, action, { title, content }) {
  // Fork repo
  // Create a branch for action
  // update existing word
  // submit the edit in new pr
}