/**
 * Resolve Datetime value for and from cookie expiry date value 
 * @param {number} expireIn 
 * @returns {Date}
 */
export function resolveCookieExpiryDate(expireIn) {
  const now = new Date();
  return new Date(now.getTime() + expireIn * 1000);
}