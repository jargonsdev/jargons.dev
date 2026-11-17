/**
 * Resolve Datetime value for and from cookie expiry date value
 * @param {number} expireIn - Time in seconds until cookie expires
 * @returns {Date}
 */
export function resolveCookieExpiryDate(expireIn) {
  const now = new Date();
  return new Date(now.getTime() + expireIn * 1000);
}

/**
 * Get repository Owner and Name from fullname
 * @param {string} repoFullname - Full repository name in format "owner/repo"
 * @returns {{ repoOwner: string, repoName: string }} Object containing repository owner and name
 */
export function getRepoParts(repoFullname) {
  const parts = repoFullname.split("/");
  const [repoOwner, repoName] = [parts[0], parts[1]];

  return {
    repoOwner,
    repoName,
  };
}

/**
 * Normalize a string to something usable in url
 * @param {string} string - The string to normalize for URL usage
 * @returns {string}
 */
export function normalizeAsUrl(string) {
  return string.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Checks if a given object is empty
 * @param {object} object - The object to check for emptiness
 * @returns {boolean}
 */
export function isObjectEmpty(object) {
  return JSON.stringify(object) === "{}";
}

/**
 * Resolve action (`new` or `edit` word) being perfored in Word editor from pathanme
 * @param {string} pathname - The pathname to extract action from
 * @returns {"new" | "edit"}
 */
export function resolveEditorActionFromPathname(pathname) {
  return pathname.slice(1).split("/")[1].toLowerCase();
}

/**
 * Capitalize the first letter of each word in a text string
 * @param {string} text - The text to capitalize
 * @returns {string} Text with each word's first letter capitalized
 */
export function capitalizeText(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Toggle or switch Markdown list prefixes on the current line or selected lines
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {"- " | "1. "} prefix
 * @returns {{ value: string, start: number, end: number }}
 */
export function toggleMarkdownListPrefix(value, start, end, prefix) {
  const firstLineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lastLineStart =
    start === end ? firstLineStart : value.lastIndexOf("\n", end - 2) + 1;
  const lineStarts = [firstLineStart];
  let lineStart = firstLineStart;

  while (lineStart < lastLineStart) {
    const newlineIndex = value.indexOf("\n", lineStart);
    if (newlineIndex === -1) break;

    lineStart = newlineIndex + 1;
    lineStarts.push(lineStart);
  }

  const targetKind = prefix.startsWith("-") ? "unordered" : "ordered";
  const edits = lineStarts.map((startIndex) => {
    const lineEnd = value.indexOf("\n", startIndex);
    const line = value.slice(
      startIndex,
      lineEnd === -1 ? value.length : lineEnd,
    );
    const indentation = line.match(/^[ \t]*/)[0];
    const prefixStart = startIndex + indentation.length;
    const existingPrefix = line
      .slice(indentation.length)
      .match(/^([-*+]|\d+[.)])[ \t]+/);
    const existingKind = existingPrefix
      ? /^[-*+]$/.test(existingPrefix[1])
        ? "unordered"
        : "ordered"
      : null;

    return {
      start: prefixStart,
      removeLength: existingPrefix?.[0].length ?? 0,
      insertText: existingKind === targetKind ? "" : prefix,
    };
  });

  let updatedValue = value;
  for (const edit of [...edits].reverse()) {
    updatedValue = `${updatedValue.slice(0, edit.start)}${edit.insertText}${updatedValue.slice(edit.start + edit.removeLength)}`;
  }

  return {
    value: updatedValue,
    start: mapListSelectionPosition(start, edits),
    end: mapListSelectionPosition(end, edits),
  };
}

function mapListSelectionPosition(position, edits) {
  let offset = 0;

  for (const edit of edits) {
    if (position < edit.start) break;

    if (position <= edit.start + edit.removeLength) {
      return edit.start + offset + edit.insertText.length;
    }

    offset += edit.insertText.length - edit.removeLength;
  }

  return position + offset;
}

/**
 * Generate branch name
 * @param {string} action - The action type (e.g., "new" or "edit")
 * @param {string} wordTitle - The title of the word
 * @returns {string}
 */
export function generateBranchName(action, wordTitle) {
  return `word/${action}/${normalizeAsUrl(wordTitle)}`;
}

/**
 * Build URL to the Pull Request list on the project's Repo
 * @param {string} repoFullname - Full repository name in format "owner/repo"
 * @param {string} queryString - Query string to filter pull requests
 * @returns {string}
 */
export function buildStatsUrl(repoFullname, queryString) {
  return `https://github.com/${repoFullname}/pulls?q=${encodeURIComponent(queryString)}`;
}

/**
 * Build Word Pathname From Slug
 * @param {string} slug - The word slug to build pathname from
 * @returns {string}
 */
export function buildWordPathname(slug) {
  return `/browse/${slug}`;
}

/**
 * Build Word Slug From ID
 * @param {string} id - The word ID to extract slug from
 * @returns {string}
 */
export function buildWordSlug(id) {
  return id.split(".")[0];
}

/**
 * Get branch name from branch ref
 * @param {string} branchRef
 * @returns {string}
 */
export function getBranchNameFromRef(branchRef) {
  return branchRef.split("/").slice(2).join("/");
}
