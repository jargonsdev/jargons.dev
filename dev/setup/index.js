import crypto from "node:crypto";
import fs from "node:fs/promises";
import registerGitHubApp from "./lib/index.js";

// register app and retrieve credentials
const appCredentials = await registerGitHubApp({
  // name of your app
  name: "jargons.dev-app-for-",
  url: "https://github.com/jargonsdev/jargons.dev/CONTRIBUTING.md",
  default_permissions: {
    issues: "write",
  },
});

// convert private key to pkcs8 format (recommended for better cross plattform support)
const privateKeyPKCS8 = String(
  crypto.createPrivateKey(appCredentials.pem).export({
    type: "pkcs8",
    format: "pem",
  }),
);
const singleLinePrivateKey = privateKeyPKCS8.trim().replace(/\n/g, "\\n");

// write credentials into `.env` file
const envFileTemp = await fs.readFile(".env.example", "utf-8");
const newEnvFileContent = envFileTemp
  .replace(/^GITHUB_APP_ID=.*$/m, `GITHUB_APP_ID=${appCredentials.id}`)
  .replace(
    /^GITHUB_APP_PRIVATE_KEY=.*$/m,
    `GITHUB_APP_PRIVATE_KEY="${singleLinePrivateKey}"`,
  );
await fs.writeFile(".env", newEnvFileContent);
