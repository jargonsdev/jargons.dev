

export default function RecentSearchesLoading ({ recentSearches })  {
  return (
    <div className="space-y-3 ml-2 mt-4 md:mt-6">
      <h2 className="text-2xl md:text-4xl font-black">Recent</h2>
      <ol className="space-y-1.5 underline">
        {Object.values(recentSearches).slice(0, 5).map((item, i) => (
          <li key={i}>
            <div
              className="placeholder-text bg-gray-300 rounded animate-pulse"
              style={{ width: `${item.word.length * 8}px`, height: '24px' }}
            ></div>
          </li>
        ))}
      </ol>
    </div>
  );
};

