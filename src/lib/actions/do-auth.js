import app from "../octokit/app.js";
import { decrypt, encrypt } from "../utils/crypto.js";
import { GET as getAuthorization } from "../../pages/api/github/oauth/authorize.js";
import {
  isObjectEmpty as isStateEmpty,
  resolveCookieExpiryDate,
} from "../utils/index.js";

/**
 * Authentication action with GitHub OAuth
 * @param {import("astro").AstroGlobal} astroGlobal
 */
export default async function doAuth(astroGlobal) {
  const {
    url: { searchParams },
    cookies,
  } = astroGlobal;
  const code = searchParams.get("code");
  const accessToken = cookies.get("jargonsdevToken", {
    decode: (value) => decrypt(value),
  });

  /**
   * Generate OAuth Url to start authorization flow
   * @todo improvement: store `state` in cookie for later retrieval/comparison with auth `state` in `github/oauth/callback`
   * @param {{ path: string }} state
   */
  function getAuthUrl(state) {
    let parsedState = "";

    if (!isStateEmpty(state)) {
      if (state.path) parsedState += `path:${state.path}`;
      const otherStates = String(
        Object.keys(state)
          .filter((key) => key !== "path")
          .map((key) => key + ":" + state[key])
          .join("|")
      );
      if (otherStates.length > 0) parsedState += `|${otherStates}`;
    }

    const { url } = app.oauth.getWebFlowAuthorizationUrl({
      state: parsedState,
    });

    return url;
  }

  try {
    if (code) {
      const response = await getAuthorization(astroGlobal);
      const auth = await response.json();

      if (auth.accessToken) {
        cookies.set("jargonsdevToken", auth.accessToken, {
          expires: resolveCookieExpiryDate(28800),
          path: "/",
          encode: (value) => encrypt(value),
        });
      }
    }

    const userOctokit = app.getUserOctokit({ token: accessToken.value });
    const { data } = await userOctokit.request("GET /user");

    return {
      getAuthUrl,
      isAuthed: true,
      authedData: data,
    };
  } catch (error) {
    return {
      getAuthUrl,
      isAuthed: false,
      authedData: null,
    };
  }
}
