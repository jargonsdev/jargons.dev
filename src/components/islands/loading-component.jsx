

export default function LoadingComponent() {


  return (
    <div className="space-y-3 ml-2 mt-4 md:mt-6 loading">
      <h2 className="font-black bg-gray-300 rounded animate-pulse" style={{ height: "30px", width: "150px" }}>

      </h2>

      {/* List of recent searches or placeholders */}
      <ol className="space-y-1.5 underline">
        {[...Array(5)].map((_, i) => (
          <li key={i}>
            <div
              className="placeholder-text bg-gray-300 rounded animate-pulse"
              style={{ width: "100px", height: "24px" }}
            ></div>
          </li>
        ))}

      </ol>
    </div>
  );
}
