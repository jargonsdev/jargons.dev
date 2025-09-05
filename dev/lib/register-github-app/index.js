/**
 * Register a GitHub App using the manifest flow
 * @see https://github.com/gr2m/register-github-app
 *
 * @ts-check
 */

import { createServer } from "node:http";

import { request as octokitRequest } from "@octokit/request";

const DEFAULT_MANIFEST = {
  url: "https://github.com",
};
const DEFAULT_META_OPTIONS = {
  githubUrl: "https://github.com",
  githubApiUrl: "https://api.github.com",
  log: console.log.bind(console),
};

/**
 * @param {import('./index').Manifest} manifest
 * @param {import('./index').MetaOptions} metaOptions
 * @returns {Promise<import('./index').AppCredentials>}
 */
export default async function registerGitHubApp(
  { org, ...manifest } = DEFAULT_MANIFEST,
  metaOptions = DEFAULT_META_OPTIONS,
) {
  // defaults
  manifest.url ||= org ? `https://github.com/${org}` : "https://github.com";
  manifest.public ||= false;
  manifest.setup_on_update ||= false;
  manifest.request_oauth_on_install ||= false;

  metaOptions.githubUrl ||= DEFAULT_META_OPTIONS.githubUrl;
  metaOptions.githubApiUrl ||= DEFAULT_META_OPTIONS.githubApiUrl;

  const log = metaOptions.log || DEFAULT_META_OPTIONS.log;

  const manifestRequest = (metaOptions.request || octokitRequest).defaults({
    baseUrl: metaOptions.githubApiUrl,
    method: "POST",
    url: "/app-manifests/{code}/conversions",
  });

  return new Promise((resolve, reject) => {
    // start the server at an available port
    const server = createServer();

    server.listen(metaOptions.port || 0);

    const port =
      metaOptions.port ||
      // @ts-expect-error - I have yet to see a usecase when `server.address()` can be a string
      server.address().port;

    log(`Open http://localhost:${port}`);

    server.on("error", (error) => {
      reject(new Error("A server error occured", { cause: error }));
      server.close();
    });

    // Listen to the request event
    server.on("request", async (request, response) => {
      const url = new URL(request.url, `http://localhost:${port}`);

      const code = url.searchParams.get("code");
      if (code) {
        const { data: appCredentials } = await manifestRequest({
          code,
        });

        console.log(appCredentials);

        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(`
          <meta charset="utf-8">
          <h1>GitHub App registered successfully</h1>
          <p>
            Now follow this steps below..
            <ul>
              <li>
                Create a new github repository with name "jargons.dev-test" at <a target="_blank" href="https://github.com/new">https://github.com/new</a>
              </li>
              <li>
                Copy and paste the repo name in full as value to the "PUBLIC_PROJECT_REPO" in the newly created .env; 
                <br>
                Example: (assuming you chose the suggested name)
                <br>
                <code>
                  PUBLIC_PROJECT_REPO="${appCredentials.owner.login}/jargons.dev-test"
                </code>
              </li>
              <li>
                Then follow this link to install the app on the repo <a href="${appCredentials.html_url}">${appCredentials.html_url}</a>. 
              </li>
            </ul>
          </p>
        `);

        resolve(appCredentials);

        server.close();
        return;
      }

      const registerUrl = org
        ? `${metaOptions.githubUrl}/organizations/${org}/settings/apps/new`
        : `${metaOptions.githubUrl}/settings/apps/new`;
      const manifestJson = JSON.stringify({
        redirect_url: `http://localhost:${port}`,
        ...manifest,
      });

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(`
        <meta charset="utf-8">
        <h1>Registering GitHub App</h1>
        <form action="${registerUrl}" method="post">
          <input type="hidden" name="manifest" id="manifest">
          <input type="submit" value="Submit" id="submit">
        </form>

        <p>
          You will be redirected automatically …
        </p>

        <script>
          const input = document.getElementById("manifest")
          input.value = \`${manifestJson}\`

          document.getElementById("submit").click()
        </script>
      `);
    });
  });
}
