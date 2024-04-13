import app from "../octokit/app.js";
import { decrypt } from "../utils/crypto.js";

/**
 * Resolve octokit Auth tokens for current user and devJargons App
 * @param {import("astro").AstroGlobal} astroGlobal 
 * 
 * @todo ideally: encrypt the `tokens` for later decryption on client-side
 * @todo i.e. remove `decode` operation from the `userAuthToken` cookie data fetch
 * @see all todos can be resolved here: https://github.com/babblebey/jargons.dev/issues/37 
 */
export default function doOctokitAuth({ cookies }) {
  const userAuthToken = cookies.get("jargons.dev:token", { 
    decode: value => decrypt(value) 
  });

  return {
    user: userAuthToken.value,
    devJargons: app.devJargonsAppAuth
  }
}