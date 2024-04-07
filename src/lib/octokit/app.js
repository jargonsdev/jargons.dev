import { Octokit } from "octokit";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { oauthAuthorizationUrl } from "@octokit/oauth-authorization-url";

/**
 * OAuth App Octokit instance
 */
const octokit = new Octokit({
  authStrategy: createOAuthAppAuth,
  auth: {
    clientId: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
    clientSecret: import.meta.env.GITHUB_OAUTH_APP_CLIENT_SECRET
  },
});

/**
 * Generate an Web (OAuth) Flow url to start an OAuth flow
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

export default { 
  octokit,
  oauth: {
    getWebFlowAuthorizationUrl
  }
}