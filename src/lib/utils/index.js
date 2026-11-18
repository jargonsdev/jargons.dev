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

/**
 * Continue a Markdown list on Enter or exit an empty list item
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @returns {{ value: string, start: number, end: number } | null}
 */
export function continueMarkdownListOnEnter(value, start, end) {
  if (start !== end) return null;

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const newlineIndex = value.indexOf("\n", start);
  const lineEnd = newlineIndex === -1 ? value.length : newlineIndex;
  const line = value.slice(lineStart, lineEnd).replace(/\r$/, "");
  const listItem = line.match(/^([ \t]*)([-*+]|(\d+)([.)]))([ \t]+)/);

  if (!listItem) return null;

  const [listPrefix, indentation, marker, number, delimiter] = listItem;
  const contentStart = lineStart + listPrefix.length;
  const itemContent = value.slice(contentStart, lineEnd).trim();

  if (!itemContent) {
    return {
      value: `${value.slice(0, lineStart)}${value.slice(lineEnd)}`,
      start: lineStart,
      end: lineStart,
    };
  }

  const nextMarker = number
    ? `${String(Number(number) + 1).padStart(number.length, "0")}${delimiter}`
    : marker;
  const nextPrefix = `${indentation}${nextMarker}${listItem[5]}`;
  const insertion = `\n${nextPrefix}`;

  return {
    value: `${value.slice(0, start)}${insertion}${value.slice(end)}`,
    start: start + insertion.length,
    end: start + insertion.length,
  };
}

/**
 * Toggle a Markdown wrapper or switch between inline code and a code block
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {string} marker
 * @returns {{ value: string, start: number, end: number }}
 */
export function toggleMarkdownWrap(value, start, end, marker) {
  const codeBlock =
    marker === "`" ? findMarkdownCodeBlock(value, start, end) : null;
  if (codeBlock) {
    const code = value.slice(codeBlock.contentStart, codeBlock.contentEnd);
    const result = replaceCodeBlockContent(
      value,
      start,
      end,
      codeBlock,
      `\`${code}\``,
    );
    return { ...result, start: result.start + 1, end: result.end + 1 };
  }

  const activeWrapper = findMarkdownWrapper(value, start, end, marker);
  if (activeWrapper) {
    return removeMarkdownWrapper(value, start, end, activeWrapper);
  }

  const selectedText = value.slice(start, end);
  const wrappedText = `${marker}${selectedText}${marker}`;

  if (start === end) {
    const cursor = start + marker.length;
    return {
      value: `${value.slice(0, start)}${wrappedText}${value.slice(end)}`,
      start: cursor,
      end: cursor,
    };
  }

  const selectionStart = start + marker.length;
  return {
    value: `${value.slice(0, start)}${wrappedText}${value.slice(end)}`,
    start: selectionStart,
    end: selectionStart + selectedText.length,
  };
}

/**
 * Toggle a Markdown code fence or switch to/from inline code
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @returns {{ value: string, start: number, end: number }}
 */
export function toggleMarkdownCodeBlock(value, start, end) {
  const codeBlock = findMarkdownCodeBlock(value, start, end);
  if (codeBlock) {
    return {
      ...replaceCodeBlockContent(
        value,
        start,
        end,
        codeBlock,
        value.slice(codeBlock.contentStart, codeBlock.contentEnd),
      ),
    };
  }

  const inlineCode = findMarkdownWrapper(value, start, end, "`");
  if (inlineCode) {
    const inlineContent = value.slice(
      inlineCode.contentStart,
      inlineCode.contentEnd,
    );
    const unwrappedValue = `${value.slice(0, inlineCode.start)}${inlineContent}${value.slice(inlineCode.end)}`;
    const result = wrapMarkdownCodeBlock(
      unwrappedValue,
      inlineCode.start,
      inlineCode.start + inlineContent.length,
    );
    const relativeStart = Math.max(0, start - inlineCode.contentStart);
    const relativeEnd = Math.max(0, end - inlineCode.contentStart);

    return {
      ...result,
      start: result.start + relativeStart,
      end: result.start + relativeEnd,
    };
  }

  return wrapMarkdownCodeBlock(value, start, end);
}

function wrapMarkdownCodeBlock(value, start, end) {
  const selectedText = value.slice(start, end);
  const leadingNewline = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
  const fence = String.fromCharCode(96).repeat(3);
  const openingFence = `${leadingNewline}${fence}\n`;
  const closingFence = `${selectedText.endsWith("\n") ? "" : "\n"}\`\`\`${
    end < value.length && value[end] !== "\n" ? "\n" : ""
  }`;
  const selectionStart = start + openingFence.length;

  return {
    value: `${value.slice(0, start)}${openingFence}${selectedText}${closingFence}${value.slice(end)}`,
    start: selectionStart,
    end: selectionStart + selectedText.length,
  };
}

function findMarkdownWrapper(value, start, end, marker) {
  const markerLength = marker.length;

  if (
    end - start >= markerLength * 2 &&
    value.slice(start, start + markerLength) === marker &&
    value.slice(end - markerLength, end) === marker
  ) {
    return {
      start,
      contentStart: start + markerLength,
      contentEnd: end - markerLength,
      end,
    };
  }

  const openingStart = value.lastIndexOf(marker, start - markerLength);
  const closingStart = value.indexOf(marker, end);

  if (
    openingStart === -1 ||
    closingStart === -1 ||
    value.indexOf(marker, openingStart + markerLength) !== closingStart ||
    value.slice(openingStart + markerLength, closingStart).includes("\n") ||
    start < openingStart + markerLength ||
    end > closingStart
  ) {
    return null;
  }

  return {
    start: openingStart,
    contentStart: openingStart + markerLength,
    contentEnd: closingStart,
    end: closingStart + markerLength,
  };
}

function removeMarkdownWrapper(value, start, end, wrapper) {
  const markerLength = wrapper.contentStart - wrapper.start;
  const mapPosition = (position) => {
    if (position < wrapper.contentStart) {
      return Math.max(wrapper.start, position);
    }
    if (position <= wrapper.contentEnd) return position - markerLength;
    if (position <= wrapper.end) return wrapper.contentEnd - markerLength;
    return position - markerLength * 2;
  };

  return {
    value: `${value.slice(0, wrapper.start)}${value.slice(wrapper.contentStart, wrapper.contentEnd)}${value.slice(wrapper.end)}`,
    start: mapPosition(start),
    end: mapPosition(end),
  };
}

function findMarkdownCodeBlock(value, start, end) {
  let openingStart = value.lastIndexOf("```\n", start);
  let openingLength = 4;

  if (openingStart === -1) {
    openingStart = value.lastIndexOf("```\r\n", start);
    openingLength = 5;
  }

  if (openingStart === -1) return null;

  const contentStart = openingStart + openingLength;
  let closingStart = value.indexOf("```", Math.max(end, contentStart));

  while (closingStart !== -1) {
    const isLineStart = closingStart === 0 || value[closingStart - 1] === "\n";
    const lineEnd = value.indexOf("\n", closingStart);
    const fenceLine = value.slice(
      closingStart,
      lineEnd === -1 ? value.length : lineEnd,
    );

    if (isLineStart && fenceLine.trim() === "```") break;
    closingStart = value.indexOf("```", closingStart + 3);
  }

  if (closingStart === -1 || start < contentStart) return null;

  const contentEnd =
    closingStart > end && value[closingStart - 1] === "\n"
      ? closingStart - 1
      : closingStart;

  return {
    start: openingStart,
    contentStart,
    contentEnd,
    end: closingStart + 3,
  };
}

function replaceCodeBlockContent(value, start, end, codeBlock, replacement) {
  return {
    value: `${value.slice(0, codeBlock.start)}${replacement}${value.slice(codeBlock.end)}`,
    start: mapCodeBlockPosition(start, codeBlock),
    end: mapCodeBlockPosition(end, codeBlock),
  };
}

function mapCodeBlockPosition(position, codeBlock) {
  if (position <= codeBlock.contentStart) {
    return codeBlock.start;
  }

  if (position <= codeBlock.contentEnd) {
    return codeBlock.start + position - codeBlock.contentStart;
  }

  return position - (codeBlock.contentStart - codeBlock.start) - 3;
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
