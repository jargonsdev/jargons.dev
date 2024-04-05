import app from "../octokit/app.js";
import { getExistingWord } from "../word-editor.js";

/**
 * Edit Word action - meant to be executed on `editor/edit/[word]` route
 * @param {import("astro").AstroGlobal} astroGlobal 
 */
export default async function doEditWord(astroGlobal) {
  const { cookies, params: { word } } = astroGlobal;

  const accessToken = cookies.get("jargons.dev:token", { decode: value => decrypt(value) });
  const userOctokit = await app.oauth.getUserOctokit({ token: accessToken.value });

  const projectRepoDetails = {
    repoFullname: import.meta.env.PROJECT_REPO,
    repoBranchRef: import.meta.env.PROJECT_REPO_BRANCH_REF
  }

  const response = await getExistingWord(userOctokit, projectRepoDetails, word);

  return response;
}