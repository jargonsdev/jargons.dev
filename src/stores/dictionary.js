import { atom, map } from "nanostores";

export const $dictionary = atom([]);

/**
 * @typedef {Object} DictionaryItem
 * @property {string} title
 * @property {string} content
 */

/** @type {import('nanostores').MapStore<Record<string, DictionaryItem>>} */
export const $dictionaryEditor = map({
  title: "",
  content: ""
});