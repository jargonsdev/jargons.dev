import app from "../octokit/app.js";
import { getExistingWord } from "../word-editor.js";
import { PROJECT_REPO_DETAILS } from "../../../constants.js";

/**
 * Edit Word action - meant to be executed on `editor/edit/[word]` route
 * @param {import("astro").AstroGlobal} astroGlobal 
 */
export default async function doEditWord(astroGlobal) {
  const { cookies, params: { word } } = astroGlobal;

  const accessToken = cookies.get("jargons.dev:token", { decode: value => decrypt(value) });
  const userOctokit = app.getUserOctokit({ token: accessToken.value });

  const response = await getExistingWord(userOctokit, PROJECT_REPO_DETAILS, word);

  return response;
}