import { LABELS } from "../../constants.js";
import { getRepoParts } from "./utils/index.js";
import newWordPRTemp from "./templates/new-word-pr.md.js";
import editWordPRTemp from "./templates/edit-word-pr.md.js";

/**
 * Submit word - create a Pull Request to add word to project repository
 * @param {import("octokit").Octokit} jargonsdevOctokit 
 * @param {import("octokit").Octokit} userOctokit 
 * @param {"new" | "edit"} action 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} projectRepoDetails 
 * @param {{ repoFullname: string, repoChangeBranchRef: string }} forkedRepoDetails 
 * @param {{ title: string, content: string }} word 
 * 
 * @todo implement (submit as) `draft` feature - [idea]
 */
export async function submitWord(jargonsdevOctokit, userOctokit, action, projectRepoDetails, forkedRepoDetails, word) {
  const { repoFullname, repoMainBranchRef } = projectRepoDetails;
  const { repoName, repoOwner } = getRepoParts(repoFullname);
  const { repoOwner: forkedRepoOwner } = getRepoParts(forkedRepoDetails.repoFullname);
  const baseBranch = repoMainBranchRef.split("/").slice(2).join("/");
  const headBranch = forkedRepoDetails.repoChangeBranchRef.split("/").slice(2).join("/");

  const title = action === "new" 
    ? newWordPRTemp.title.replace("$word_title", word.title)
    : editWordPRTemp.title.replace("$word_title", word.title);

  const body = action === "new"
    ? newWordPRTemp.content.replace("$word_title", word.title).replace("$word_content", word.content)
    : editWordPRTemp.content.replace("$word_title", word.title).replace("$word_content", word.content);

  const response = await userOctokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner: repoOwner,
    repo: repoName,
    head: `${forkedRepoOwner}:${headBranch}`,
    base: baseBranch,
    title,
    body,
    maintainers_can_modify: true
  });

  // jargons-dev (bot) App adds related labels to PR
  await jargonsdevOctokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/labels", {
    owner: repoOwner,
    repo: repoName,
    issue_number: response.data.number,
    labels: [
      action === "new" ? LABELS.NEW_WORD : LABELS.EDIT_WORD,
      LABELS.VIA_EDITOR
    ]
  });

  return response.data;
}