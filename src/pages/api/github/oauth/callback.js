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

  /**
   * `!path.includes("jai=1")` is a workaround for the following:
   * - When the `path` is a statically rendered page e.g `word.astro` template, 
   * ...we don't want to redirect to it; they can't handle server-side operations like using authorization code
   */
  if (path && !path.includes("jai=1")) return redirect(`${path}?code=${code}`);

  // Lifeline/Last resort for when the return `path` is NOT specified/found in state
  return redirect(`/login?return_to=${encodeURIComponent(path || "/")}&code=${code}`);
}
