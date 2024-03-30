/**
 * GitHub oauth code authorization
 * @param {import("astro").APIContext} context
 * @returns {Response}
 */
export async function GET({ url: { searchParams } }) {
  const code = searchParams.get("code");

  if (!code) {
    return new Response("authorization code is not set", { status: 400 })
  }

  const queryParams = new URLSearchParams();
  queryParams.append("code", code);
  queryParams.append("client_id", import.meta.env.GITHUB_APP_CLIENT_ID);
  queryParams.append("client_secret", import.meta.env.GITHUB_APP_CLIENT_SECRET);

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: queryParams
    });
    const responseText = await response.text();
    const responseData = new URLSearchParams(responseText);

    return new Response(JSON.stringify({
      accessToken: responseData.get("access_token"),
      expiresIn: Number(responseData.get("expires_in")),
      refreshToken: responseData.get("refresh_token"),
      refreshTokenExpiresIn: Number(responseData.get("refresh_token_expires_in"))
    }), { status: 200 });
  } catch (error) {
    throw new Error(error);
  }
}
