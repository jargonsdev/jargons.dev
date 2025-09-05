import app from "../../../../lib/octokit/app.js";

/**
 * GitHub oauth code authorization
 * @param {import("astro").APIContext} context
 * @returns {Promise<Response>}
 */
export async function GET({ url: { searchParams } }) {
  const code = searchParams.get("code");

  if (!code) {
    return new Response("authorization code is not set", { status: 400 });
  }

  try {
    const auth = await app.oauth.exchangeWebFlowCode(code);

    return new Response(
      JSON.stringify({
        accessToken: auth.get("access_token"),
        expiresIn: Number(auth.get("expires_in")),
      }),
      { status: 200 },
    );
  } catch (error) {
    throw new Error(error);
  }
}
