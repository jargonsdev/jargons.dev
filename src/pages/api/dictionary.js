import app from "../../lib/octokit/app.js";
import { forkRepository, getForkStatus } from "../../lib/fork.js";
import { decrypt } from "../../lib/utils/crypto.js";
import { submitWord } from "../../lib/submit-word.js";
import { CONTENT_REPO_DETAILS } from "../../../constants.js";
import { createBranch, deleteBranch } from "../../lib/branch.js";
import { updateExistingWord, writeNewWord } from "../../lib/word-editor.js";
import { capitalizeText, generateBranchName } from "../../lib/utils/index.js";

/**
 * Submit Word (New or Edit) to the Dictionary
 * @param {import("astro").APIContext} context
 */
export async function POST({ request, cookies }) {
  const data = await request.formData();
  const accessToken = cookies.get("jargonsdevToken", {
    decode: (value) => decrypt(value),
  });

  // Verify accessToken validity
  const { data: authData, status: verificationStatus } =
    await app.oauth.octokit.request("POST /applications/{client_id}/token", {
      client_id: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
      access_token: accessToken.value,
    });

  if (!accessToken || verificationStatus !== 200) {
    return new Response(JSON.stringify({ message: "Not Authorised" }), {
      status: 401,
      headers: {
        "Content-type": "application/json",
      },
    });
  }

  const title = capitalizeText(data.get("title").trim());
  const content = data.get("content");
  const action = data.get("action");
  const metadata = JSON.parse(data.get("metadata"));

  const userOctokit = app.getUserOctokit({ token: accessToken.value });
  const jargonsdevOctokit = app.octokit;

  try {
    let forkStatus = await getForkStatus(userOctokit, CONTENT_REPO_DETAILS);
    if (forkStatus.status === "out-of-date") {
      return new Response(
        JSON.stringify({
          status: "out-of-date",
          message: "Update your fork before submitting this contribution.",
        }),
        {
          status: 409,
          headers: { "Content-type": "application/json" },
        },
      );
    }

    let fork = forkStatus.fork;
    if (!fork) {
      fork = await forkRepository(userOctokit, CONTENT_REPO_DETAILS);
      forkStatus = await getForkStatus(userOctokit, CONTENT_REPO_DETAILS);

      if (forkStatus.status === "out-of-date") {
        return new Response(
          JSON.stringify({
            status: "out-of-date",
            message: "Update your fork before submitting this contribution.",
          }),
          {
            status: 409,
            headers: { "Content-type": "application/json" },
          },
        );
      }

      fork = forkStatus.fork ?? fork;
    }

    console.log("Content Fork: ", fork);

    // Create a branch for action
    const branch = await createBranch(
      userOctokit,
      {
        repoFullname: fork,
        repoMainBranchRef: CONTENT_REPO_DETAILS.repoMainBranchRef,
      },
      generateBranchName(action, title),
    );
    console.log("Branch Created: ", branch);

    const forkedRepoDetails = {
      repoFullname: fork,
      repoChangeBranchRef: branch.ref,
    };

    // update existing word - if action is "edit"
    if (action === "edit") {
      const updatedWord = await updateExistingWord(
        userOctokit,
        forkedRepoDetails,
        {
          title,
          content,
          path: metadata.path,
          sha: metadata.sha,
        },
        {
          env: "node",
        },
      );
      console.log("Word updated: ", updatedWord);
    }

    // add new word - if action is "new"
    if (action === "new") {
      const newWord = await writeNewWord(
        userOctokit,
        forkedRepoDetails,
        {
          title,
          content,
        },
        {
          env: "node",
        },
      );
      console.log("New word added: ", newWord);
    }

    // submit the edit in new pr
    const wordSubmission = await submitWord(
      jargonsdevOctokit,
      userOctokit,
      action,
      CONTENT_REPO_DETAILS,
      forkedRepoDetails,
      {
        title,
        content,
      },
    );
    console.log("Word submitted: ", wordSubmission);

    return new Response(JSON.stringify(wordSubmission), {
      status: 200,
      headers: {
        "Content-type": "application/json",
      },
    });
  } catch (error) {
    console.log(error.cause);
    const message = error.cause?.message ?? "An unexpected error occurred";
    const status = error.cause?.status ?? 500;
    return new Response(JSON.stringify({ message }), {
      status,
      headers: {
        "Content-type": "application/json",
      },
    });
  }
}

/**
 * Delete an Existing Branch Reference
 * @param {import("astro").APIContext} context
 */
export async function DELETE({ request, cookies }) {
  const data = await request.formData();
  const accessToken = cookies.get("jargonsdevToken", {
    decode: (value) => decrypt(value),
  });

  // Verify accessToken validity
  const { data: authData, status: verificationStatus } =
    await app.oauth.octokit.request("POST /applications/{client_id}/token", {
      client_id: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
      access_token: accessToken.value,
    });

  if (!accessToken || verificationStatus !== 200) {
    return new Response(JSON.stringify({ message: "Not Authorised" }), {
      status: 401,
      headers: {
        "Content-type": "application/json",
      },
    });
  }

  const title = capitalizeText(data.get("title").trim());
  // const content = data.get("content");
  const action = data.get("action");
  // const metadata = JSON.parse(data.get("metadata"));

  const userOctokit = app.getUserOctokit({ token: accessToken.value });
  // const jargonsdevOctokit = app.octokit;

  // Fork repo
  const fork = await forkRepository(userOctokit, CONTENT_REPO_DETAILS);
  console.log(fork, generateBranchName(action, title));

  try {
    await deleteBranch(userOctokit, fork, generateBranchName(action, title));

    return new Response(null, {
      status: 204,
      headers: {
        "Content-type": "application/json",
      },
    });
  } catch (error) {
    const message =
      error.cause?.message ?? error.message ?? "An error occurred";
    const status = error.cause?.status ?? 500;
    return new Response(JSON.stringify({ message }), {
      status,
      headers: {
        "Content-type": "application/json",
      },
    });
  }
}
