import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $recentSearches } from "../../lib/stores/search.js";

export default function RecentSearches() {
  const recentSearches = useStore($recentSearches);
  
  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem("jargons.dev:recent_searches"));
    if (savedSearches) {
      $recentSearches.set(savedSearches);
    }
  
    const loader = document.querySelector(".loading");
    if (loader) loader.remove();

  }, []);



  return Object.values(recentSearches).length ? (
    <div className="space-y-3 ml-2 mt-4 md:mt-6">
      <h2 className="text-2xl md:text-4xl font-black">Recent</h2>
      <ol className="space-y-1.5 underline">
        {Object.values(recentSearches).slice(0, 5).map((item, i) => (
          <li key={i}>
            <a href={item.url}>
              {item.word}
            </a>
          </li>
        ))}
      </ol>
    </div>
  ) : null;
}
