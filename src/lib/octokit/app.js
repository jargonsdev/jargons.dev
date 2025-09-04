import { Octokit, App } from "octokit";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { oauthAuthorizationUrl } from "@octokit/oauth-authorization-url";

const app = new App({
  appId: import.meta.env.GITHUB_APP_ID,
  privateKey: import.meta.env.GITHUB_APP_PRIVATE_KEY,
});
const {
  data: { id },
} = await app.octokit.request(
  `GET /repos/${import.meta.env.PUBLIC_PROJECT_REPO}/installation`,
);

/**
 * jargons.dev Helper GitHub App's Octokit instance
 */
const appOctokit = await app.getInstallationOctokit(id);

/**
 * OAuth App's Octokit instance - useful for verifying user accessToken validity
 */
const oauthAppOctokit = new Octokit({
  authStrategy: createOAuthAppAuth,
  auth: {
    clientId: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
    clientSecret: import.meta.env.GITHUB_OAUTH_APP_CLIENT_SECRET,
  },
});

/**
 * Generate a Web Flow/OAuth authorization url to start an OAuth flow
 * @param {import("@octokit/oauth-authorization-url").OAuthAppOptions} options
 * @returns
 */
function getWebFlowAuthorizationUrl({
  state,
  scopes = ["public_repo"],
  ...options
}) {
  return oauthAuthorizationUrl({
    clientId: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
    state,
    scopes,
    ...options,
  });
}

/**
 * Exchange Web Flow Authorization `code` for an `access_token`
 * @param {string} code
 * @returns {Promise<{access_token: string, scope: string, token_type: string}>}
 */
async function exchangeWebFlowCode(code) {
  const queryParams = new URLSearchParams();
  queryParams.append("code", code);
  queryParams.append("client_id", import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID);
  queryParams.append(
    "client_secret",
    import.meta.env.GITHUB_OAUTH_APP_CLIENT_SECRET,
  );

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: queryParams,
  });
  const responseText = await response.text();
  const responseData = new URLSearchParams(responseText);

  return responseData;
}

/**
 * Get a User's Octokit instance
 * @param {Omit<OctokitOptions, "auth"> & { token: string }} options
 * @returns {Octokit}
 */
function getUserOctokit({ token, ...options }) {
  return new Octokit({
    auth: token,
    ...options,
  });
}

export default {
  octokit: appOctokit,
  oauth: {
    octokit: oauthAppOctokit,
    getWebFlowAuthorizationUrl,
    exchangeWebFlowCode,
  },
  getUserOctokit,
};
