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
  return string.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Checks if a given object is empty
 * @param {object} object 
 * @returns {boolean}
 */
export function isObjectEmpty(object) {
  return JSON.stringify(object) === "{}"
}

/**
 * Resolve action (`new` or `edit` word) being perfored in Word editor from pathanme
 * @param {string} pathname 
 * @returns {"new" | "edit"}
 */
export function resolveEditorActionFromPathname(pathname) {
  return pathname.slice(1).split("/")[1].toLowerCase();
}

/**
 * Capitalize text
 * @param {string} text 
 * @returns {string}
 */
export function capitalizeText(text) {
  return text.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

/**
 * Generate branch name
 * @param {string} action 
 * @param {string} wordTitle 
 * @returns {string}
 */
export function generateBranchName(action, wordTitle) {
  return `word/${action}/${normalizeAsUrl(wordTitle)}`;
}

/**
 * Build URL to the Pull Request list on the project's Repo
 * @param {string} repoFullname 
 * @param {string} queryString 
 * @returns {string}
 */
export function buildStatsUrl(repoFullname, queryString) {
  return `https://github.com/${repoFullname}/pulls?q=${encodeURIComponent(queryString)}`;
}

/** 
 * Build Word Pathname From Slug
 * @param {string} slug
 * @returns {string}
 */
export function buildWordPathname(slug) {
  return `/browse/${slug}`;
}

/**
 * Build Word Slug From ID
 * @param {string} id
 * @returns {string}
 */
export function buildWordSlug(id) {
  return id.split(".")[0];
}