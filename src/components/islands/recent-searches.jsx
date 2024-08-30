import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $recentSearches } from "../../lib/stores/search.js";
import RecentSearchesLoading from './recent-searches-loading';

export default function RecentSearches() {
  const recentSearches = useStore($recentSearches);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem("jargons.dev:recent_searches"));
    if (savedSearches) {
      $recentSearches.set(savedSearches);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer); 
  }, []);

  if (isLoading) {
    return <RecentSearchesLoading recentSearches={recentSearches} />;
  }

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
