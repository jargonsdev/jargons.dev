import { App } from "octokit";

const app = new App({
  appId: import.meta.env.GITHUB_APP_ID,
  privateKey: import.meta.env.GITHUB_APP_PRIVATE_KEY,
  oauth: {
    clientId: import.meta.env.GITHUB_APP_CLIENT_ID,
    clientSecret: import.meta.env.GITHUB_APP_CLIENT_SECRET
  }
});

export default app;