import { atom, map } from "nanostores";

/**
 * [Deprecated] - Stopped using state to share dictionary with islands
 *
 * export const $dictionary = atom([]);
 */

/**
 * @typedef {Object} Word
 * @property {string} title
 * @property {string} content
 * @property {string} initialContent
 * @type {import('nanostores').MapStore<Record<string, Word>>}
 */
export const $wordEditor = map({
  title: "",
  content: "",
  initialContent: "",
});

export const $isWordSubmitLoading = atom(false);

export const $isWordSubmitted = atom(false);

export const $togglePreview = atom(false);
