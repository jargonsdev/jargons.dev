import app from "../../lib/octokit/app.js";
import { decrypt } from "../../lib/utils/crypto.js";
import { PROJECT_REPO_DETAILS } from "../../../constants.js";
import { generateBranchName } from "../../lib/utils/index.js";

/**
 * Submit New Word to Dictionary
 * @param {import("astro").APIContext} context
 */
export async function POST({ request, cookies }) {
  const data = await request.formData();
  const accessToken = cookies.get("jargons.dev:token", {
    decode: value => decrypt(value)
  });

  // Verify accessToken validity
  const { data: authData, status: verificationStatus } = await app.octokit.request("POST /applications/{client_id}/token", {
    client_id: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
    access_token: accessToken.value
  });

  if (!accessToken || verificationStatus !== 200) {
    return new Response(JSON.stringify({ message: "Not Authorised" }), {
      status: 401,
      headers: {
        "Content-type": "application/json"
      }
    })
  }
  
  // console.log(cookies.get("jargons.dev:token"));
  
  const title = data.get("title");
  const content = data.get("content");
  const action = data.get("action");
  const metadata = JSON.parse(data.get("metadata"));

  // console.log({
  //   title, content, action, metadata
  // });

  const userOctokit = app.getUserOctokit({ token: accessToken.value });
  const devJargonsOctokit = app.devJargonsOctokit;

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
  
  // update existing word - if action is "edit"
  if (action === "edit") {
    const updatedWord = await updateExistingWord(userOctokit, forkedRepoDetails, {
      title,
      content,
      path: metadata.path,
      sha: metadata.sha
    }, {
      env: "browser"
    });
    console.log("Word updated: ", updatedWord);
  }

  // add new word - if action is "new"
  if (action === "new") {
    const newWord = await writeNewWord(userOctokit, forkedRepoDetails, {
      title, 
      content
    }, {
      env: "browser"
    });
    console.log("New word added: ", newWord);
  }

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

  return new Response(JSON.stringify(""), {
    status: 200,
    headers: {
      "Content-type": "application/json"
    }
  });
}