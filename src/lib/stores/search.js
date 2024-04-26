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
 * 
 * @todo implement logic to allow holding maximum of 5 words by removing older words when new a one gets added
 */
export function $addToRecentSearchesFn({ word, url }) {
  // Re-initialise the state with current localStorage value
  $recentSearches.set({...JSON.parse(localStorage.getItem("jargons.dev:recent_searches"))});

  const lowercaseKey = word.toLowerCase();
  const key = lowercaseKey.includes(" ") ? lowercaseKey.split(" ").join("-") : lowercaseKey;
  const isInRecentSearch = $recentSearches.get()[key];

  if (!isInRecentSearch) {
    const recentSearchesCopy = $recentSearches.get();
    recentSearchesCopy[key] = {
      word, 
      url 
    };
    $recentSearches.set({...recentSearchesCopy});
  } else {
    return;
  }
  
  localStorage.setItem("jargons.dev:recent_searches", JSON.stringify($recentSearches.get()));
}