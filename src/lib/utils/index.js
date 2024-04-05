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
 * @param {string} repoFullname
 * @returns an object with `repoOwner` and `repoName`
 */
export function getRepoParts(repoFullname) {
  const parts = repoFullname.split("/");
  const [ repoOwner, repoName ] = [ parts[0], parts[1] ];

  return {
    repoOwner,
    repoName
  }
}

/**
 * Normalize a string to something usable in url
 * @param {string} string 
 * @returns {string}
 */
export function normalizeAsUrl(string) {
  return string.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Checks if a given object is empty
 * @param {object} object 
 * @returns {boolean}
 */
export function isObjectEmpty(object) {
  return JSON.stringify(object) === "{}"
}