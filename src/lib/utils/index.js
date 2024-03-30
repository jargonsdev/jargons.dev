/**
 * Resolve Datetime value for and from cookie expiry date value 
 * @param {number} expireIn 
 * @returns {Date}
 */
export function resolveCookieExpiryDate(expireIn) {
  const now = new Date();
  return new Date(now.getTime() + expireIn * 1000);
}

/**
 * Get repository Owner and Name from fullname
 * @param {string} repoFullName
 * @returns an object with `repoOwner` and `repoName`
 */
export function getRepoParts(repoFullName) {
  const parts = repoFullname.split("/");
  const [ repoOwner, repoName ] = [ parts[0], parts[1] ];

  return {
    repoOwner,
    repoName
  }
}