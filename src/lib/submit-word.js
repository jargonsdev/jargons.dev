import app from "./octokit/app.js";
import { getRepoParts } from "./utils/index.js";
import newWordPRTemp from "./templates/new-word-pr.md.js";

/**
 * 
 * @param {import("octokit").Octokit} userOctokit 
 * @param {"new" | "edit"} action 
 * @param {{ repoFullname: string, repoMainBranchRef: string }} projectRepoDetails 
 * @param {{ repoFullname: string, repoChangeBranchRef: string }} forkedRepoDetails 
 * @param {{ title: string, content: string }} word 
 */
export async function submitWord(userOctokit, action, projectRepoDetails, forkedRepoDetails, word) {
  const { repoFullname, repoMainBranchRef } = projectRepoDetails;
  const { repoName, repoOwner } = getRepoParts(repoFullname);
  const { repoOwner: forkedRepoOwner } = getRepoParts(forkedRepoDetails.repoFullname);
  const baseBranch = repoMainBranchRef.split("/").slice(2).join("/");
  const headBranch = forkedRepoDetails.repoChangeBranchRef.split("/").slice(2).join("/");

  const response = await userOctokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner: repoOwner,
    repo: repoName,
    head: `${forkedRepoOwner}:${headBranch}`,
    base: baseBranch,
    title: newWordPRTemp.title.replace("$word_title", word.title),
    body: newWordPRTemp.content.replace("$word_title", word.title).replace("$word_content", word.content)
  });

  // DevJargons (bot) App adds related labels to PR
  app.devJargonsOctokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/labels", {
    owner: repoOwner,
    repo: repoName,
    issue_number: response.data.number,
    labels: [
      `:book: ${action} word`,
      ":computer: via word-editor"
    ]
  });

  return response.data;
}