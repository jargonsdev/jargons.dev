import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $recentSearches } from "../../lib/stores/search.js";

/**
 * Recent Searches Component - An Island that displays a user's last 5 searches
 *
 * @todo implement a default list instead of `null` when no `$recentSearch` is found
 * @todo implement loading component to avoid flickering UI
 */
export default function RecentSearches() {
  const recentSearches = useStore($recentSearches);

  useEffect(() => {
    $recentSearches.set({...JSON.parse(localStorage.getItem("jargons.dev:recent_searches"))})
  }, []);

  return Object.values(recentSearches).length ? (
    <div className="space-y-3 ml-2 mt-4 md:mt-6">
			<h2 className="text-2xl md:text-4xl font-black">Recent</h2>
			<ol className="space-y-1.5 underline">
        {Object.values(recentSearches).map((item, i) => (
          <li key={i}>
            <a href={item.url}>
              { item.word }
            </a>
          </li>
        ))}
	  </ol>
	</div>
  ) : (
	<></>
  );
}