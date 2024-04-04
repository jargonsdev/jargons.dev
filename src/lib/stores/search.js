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
  
  localStorage.setItem("devJargonsRecentSearches", JSON.stringify($recentSearches.get()));
}