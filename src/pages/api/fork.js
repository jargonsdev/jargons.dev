import app from "../../lib/octokit/app.js";
import { getForkStatus, syncForkRepository } from "../../lib/fork.js";
import { PROJECT_REPO_DETAILS } from "../../../constants.js";
import { decrypt } from "../../lib/utils/crypto.js";

async function getUserOctokit(cookies) {
  const accessToken = cookies.get("jargonsdevToken", {
    decode: (value) => decrypt(value),
  });

  if (!accessToken) return null;

  const { status } = await app.oauth.octokit.request(
    "POST /applications/{client_id}/token",
    {
      client_id: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
      access_token: accessToken.value,
    },
  );

  if (status !== 200) return null;

  return app.getUserOctokit({ token: accessToken.value });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(error) {
  return jsonResponse(
    { message: error.cause?.message ?? error.message ?? "An error occurred" },
    error.cause?.status ?? error.status ?? 500,
  );
}

/** Check fork status without creating or updating a fork. */
export async function GET({ cookies }) {
  try {
    const userOctokit = await getUserOctokit(cookies);
    if (!userOctokit) return jsonResponse({ message: "Not Authorised" }, 401);

    return jsonResponse(await getForkStatus(userOctokit, PROJECT_REPO_DETAILS));
  } catch (error) {
    return errorResponse(error);
  }
}

/** Explicitly sync an existing fork; this endpoint never creates one. */
export async function POST({ cookies }) {
  try {
    const userOctokit = await getUserOctokit(cookies);
    if (!userOctokit) return jsonResponse({ message: "Not Authorised" }, 401);

    return jsonResponse(
      await syncForkRepository(userOctokit, PROJECT_REPO_DETAILS),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
