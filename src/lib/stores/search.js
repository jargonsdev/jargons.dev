import { atom, map } from "nanostores";

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

  const lowercaseKey = word.toLowerCase();
  const key = lowercaseKey.includes(" ") ? lowercaseKey.split(" ").join("-") : lowercaseKey;

  const recentSearchesCopy = $recentSearches.get();

  if (recentSearchesCopy[key]) {
    delete recentSearchesCopy[key];
  }

  const searchEntries = Object.entries(recentSearchesCopy);

  if (searchEntries.length >= 5) {
    searchEntries.pop(); 
  }

  const updatedEntries = [[key, { word, url }], ...searchEntries];

  const updatedSearches = Object.fromEntries(updatedEntries);
  $recentSearches.set(updatedSearches);

  localStorage.setItem("jargons.dev:recent_searches", JSON.stringify(updatedSearches));
}