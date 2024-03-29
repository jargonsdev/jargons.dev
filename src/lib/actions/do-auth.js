import app from "../../lib/octokit/app.js";
import { GET } from "../../pages/api/github/oauth/authorize.js";
import { resolveCookieExpiryDate } from "../../lib/utils/index.js";

/**
 * Authentication action with GitHub OAuth
 * @param {import("astro").AstroGlobal} astroGlobal 
 */
export default async function doAuth(astroGlobal) {
  const { url: { searchParams }, cookies } = astroGlobal;
  const code = searchParams.get("code");
  const accessToken = cookies.get("jargons.dev:token");

  /**
   * Generate OAuth Url to start authorization flow
   * @todo make the `parsedState` data more predictable (order by path, redirect)
   * @param {{ path?: string, redirect?: boolean }} state 
   */
  function getAuthUrl(state) {
    const parsedState = String(Object.keys(state).map(key => key + ":" + state[key]).join("|"));
    const { url } = app.oauth.getWebFlowAuthorizationUrl({
      state: parsedState
    });
    return url;
  }

  try {
    if (!accessToken && code) {
      const response = await GET(astroGlobal);
      const responseData = await response.json();
  
      if (responseData.accessToken && responseData.refreshToken) {
        cookies.set("jargons.dev:token", responseData.accessToken, {
          expires: resolveCookieExpiryDate(responseData.expiresIn)
        });
        cookies.set("jargons.dev:refresh-token", responseData.refreshToken, {
          expires: resolveCookieExpiryDate(responseData.refreshTokenExpiresIn)
        });
      }
    }
  
    const userOctokit = await app.oauth.getUserOctokit({ token: accessToken.value });
    const { data } = await userOctokit.request("GET /user");
  
    return {
      getAuthUrl,
      isAuthed: true,
      authedData: data
    }
  } catch (error) {
    return {
      getAuthUrl,
      isAuthed: false,
      authedData: null
    }
  }
}