import { Octokit } from "octokit";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { oauthAuthorizationUrl } from "@octokit/oauth-authorization-url";

/**
 * OAuth App's Octokit instance
 */
const octokit = new Octokit({
  authStrategy: createOAuthAppAuth,
  auth: {
    clientId: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
    clientSecret: import.meta.env.GITHUB_OAUTH_APP_CLIENT_SECRET
  },
});

/**
 * Generate a Web Flow/OAuth authorization url to start an OAuth flow
 * @param {import("@octokit/oauth-authorization-url").OAuthAppOptions} options
 * @returns 
 */
function getWebFlowAuthorizationUrl({state, scopes = ["public_repo"], ...options }) {
  return oauthAuthorizationUrl({
    clientId: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
    state,
    scopes,
    ...options
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
  queryParams.append("client_secret", import.meta.env.GITHUB_OAUTH_APP_CLIENT_SECRET);

  const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: queryParams
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
    ...options
  });
};

export default { 
  octokit,
  oauth: {
    getWebFlowAuthorizationUrl, 
    exchangeWebFlowCode,
  },
  getUserOctokit
}