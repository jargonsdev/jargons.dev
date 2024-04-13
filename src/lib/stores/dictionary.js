import { atom, map } from "nanostores";

export const $dictionary = atom([]);

/**
 * @typedef {Object} Word
 * @property {string} title
 * @property {string} content
 * @type {import('nanostores').MapStore<Record<string, Word>>} 
 */
export const $wordEditor = map({
  title: "",
  content: ""
});

export const $isWordSubmitLoading = atom(false);