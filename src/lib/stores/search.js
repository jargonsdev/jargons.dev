import { atom, map } from "nanostores";
import { normalizeAsUrl } from "../utils/index.js";


export const $isSearchOpen = atom(false);

/**
 * @typedef {Object} SearchedItem
 * @property {string} word
 * @property {string} url
 */

/** @type {import('nanostores').MapStore<Record<string, SearchedItem>>} */
export const $recentSearches = map({});

/**
 * Add search term to recent search history
 * @param {SearchedItem} item 
 */
export function $addToRecentSearchesFn({ word, url }) {
  // Re-initialise the state with the current localStorage value
  const storedSearches = JSON.parse(localStorage.getItem("jargons.dev:recent_searches")) || {};
  $recentSearches.set({ ...storedSearches });

  const key = normalizeAsUrl(word);


  const recentSearchesCopy = $recentSearches.get();

  // Remove Search Entry If it already exists
  if (recentSearchesCopy[key]) {
    delete recentSearchesCopy[key];
  }

  const searchEntries = Object.entries(recentSearchesCopy);

  // Remove one Search Entry when list reach a count of 5
  if (searchEntries.length >= 5) {
    searchEntries.pop(); 
  }

  const updatedEntries = [[key, { word, url }], ...searchEntries];

  const updatedSearches = Object.fromEntries(updatedEntries);
  $recentSearches.set(updatedSearches);

  localStorage.setItem("jargons.dev:recent_searches", JSON.stringify(updatedSearches));
}