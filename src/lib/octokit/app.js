import { Octokit } from "octokit";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";

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

export default { 
  octokit
}