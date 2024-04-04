/**
 * GitHub OAuth Callback route handler
 * @param {import("astro").APIContext} context
 */
export async function GET({ url: { searchParams }, redirect }) {
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return new Response(null, { status: 400 });
  }

  const path = state.includes("path") && state.split("|")[0].split(":")[1];

  if (path) return redirect(`${path}?code=${code}`);

  // Lifeline for when the return `path` is specified in state
  return redirect(`/login?return_to=${encodeURIComponent("/")}`)
}
