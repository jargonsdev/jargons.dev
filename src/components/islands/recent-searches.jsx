import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $recentSearches } from "../../stores/search";

export default function RecenctSearches({}) {
  const recentSearches = useStore($recentSearches);

  useEffect(() => {
    $recentSearches.set({...JSON.parse(localStorage.getItem("devJargonsRecentSearches"))} ?? {})
  }, []);

  return Object.values(recentSearches).length ? (
    <div className="space-y-3 mt-4 md:mt-6">
			<h2 className="text-2xl md:text-4xl font-black">Recent</h2>
			<ol className="space-y-1.5 underline">
        {Object.values(recentSearches).slice(0, 5).map((item, i) => (
          <li key={i}>
            <a href={item.url}>
              { item.word }
            </a>
          </li>
        ))}
			</ol>
		</div>
  ) : null;
}