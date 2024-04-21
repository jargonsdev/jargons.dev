import app from "../../lib/octokit/app.js";
import { decrypt } from "../../lib/utils/crypto.js";

/**
 * Submit New Word to Dictionary
 * @param {import("astro").APIContext} context
 */
export async function POST({ request, cookies }) {
  const data = await request.formData();
  const accessToken = cookies.get("jargons.dev:token", {
    decode: value => decrypt(value)
  });

  // Verify accessToken validity
  const { data: authData, status: verificationStatus } = await app.octokit.request("POST /applications/{client_id}/token", {
    client_id: import.meta.env.GITHUB_OAUTH_APP_CLIENT_ID,
    access_token: accessToken.value
  });

  if (!accessToken || verificationStatus !== 200) {
    return new Response(JSON.stringify({ message: "Not Authorised" }), {
      status: 401,
      headers: {
        "Content-type": "application/json"
      }
    })
  }
  
  // console.log(cookies.get("jargons.dev:token"));
  
  const title = data.get("title");
  const content = data.get("content");
  const action = data.get("action");
  const metadata = JSON.parse(data.get("metadata"));


  return new Response(JSON.stringify(""), {
    status: 200,
    headers: {
      "Content-type": "application/json"
    }
  });
}