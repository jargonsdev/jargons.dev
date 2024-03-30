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
  const isRedirect = state.includes("redirect") ? state.split("|")[1].split(":")[1] : false;

  if (!isRedirect) {
    return redirect(`${path}?code=${code}&redirect=${true}`);
  }

  return redirect(`${path}?code=${code}`);
}
