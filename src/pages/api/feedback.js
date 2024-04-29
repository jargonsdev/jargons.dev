import app from "../../lib/octokit/app.js";
import { decrypt } from "../../lib/utils/crypto.js";
import { PROJECT_REPO_DETAILS } from "../../../constants.js";
import { capitalizeText, getRepoParts } from "../../lib/utils/index.js";

/**
 * Submit Word (New or Edit) to the Dictionary
 * @param {import("astro").APIContext} context
 */
export async function POST({ request, cookies }) {
  const data = await request.formData();
  const accessToken = cookies.get("jargons.dev:token", {
    decode: value => decrypt(value)
  });

  if (!accessToken) {
    return new Response(JSON.stringify({ message: "Not Authorised" }), {
      status: 401,
      headers: {
        "Content-type": "application/json"
      }
    })
  }

  const { repoName, repoOwner } = getRepoParts(PROJECT_REPO_DETAILS.repoFullname);

  const title = capitalizeText(data.get("title").trim());
  const content = data.get("feedback");
  const pathname = data.get("pathname");

  console.log(title, content, pathname);

  const userOctokit = app.getUserOctokit({ token: accessToken.value });
  const devJargonsOctokit = app.octokit;

  const { data: issue } = await userOctokit.request("POST /repos/{owner}/{repo}/issues", {
    owner: repoOwner,
    repo: repoName,
    title,
    body: content
  });

  // DevJargons (bot) App adds related labels to PR
  await devJargonsOctokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/labels", {
    owner: repoOwner,
    repo: repoName,
    issue_number: issue.number,
    labels: [
      `feedback`
    ]
  });

  return new Response(JSON.stringify(issue), {
    status: 200,
    headers: {
      "Content-type": "application/json"
    }
  });
}