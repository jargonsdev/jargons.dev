/**
 * Remove a GitHub Session - Logout of an OAuth Session
 * @param {import("astro").AstroGlobal} astroGlobal 
 */
export default async function doLogout(astroGlobal) {
  const { cookies } = astroGlobal;

  try {
    cookies.delete("jargonsdevToken");

    return {
      isLoggedOut: true
    }
  } catch (error) {
    return {
      isLoggedOut: false
    }
  }
}