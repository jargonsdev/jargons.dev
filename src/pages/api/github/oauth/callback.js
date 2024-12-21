import { decrypt } from "../../../../lib/utils/crypto.js";

/**
 * GitHub OAuth Callback route handler
 * @param {import("astro").APIContext} context
 */
export async function GET({ url: { searchParams }, redirect, cookies }) {
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return new Response(null, { status: 400 });
  }

  const storedState = cookies.get("oauthState", {
    decode: (value) => decrypt(value),
  });

  if (storedState !== state) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  cookies.delete("oauthState");

  const path = state.includes("path") && state.split("|")[0].split(":")[1];

  if (path) return redirect(`${path}?code=${code}`);

  // Lifeline/Last resort for when the return `path` is NOT specified/found in state
  return redirect(`/login?return_to=${encodeURIComponent("/")}`)
}
