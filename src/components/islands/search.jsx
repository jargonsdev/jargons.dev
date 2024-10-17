import Flexsearch from "flexsearch";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import useRouter from "../../lib/hooks/use-router.js";
import useIsMacOS from "../../lib/hooks/use-is-mac-os.js";
import useLockBody from "../../lib/hooks/use-lock-body.js";
import { $isSearchOpen, $addToRecentSearchesFn } from "../../lib/stores/search.js";

// Create Search Index
const searchIndex = new Flexsearch.Document({
  cache: 100,
  document: { 
    index: "title",
    store: ["title", "slug"] 
  },
  tokenize: "full"
});

/**
 * Search Component Island
 * @param {{ triggerSize: "sm" | "md", dictionary: MarkdownInstance<Record<string, any>>[] }} props 
 */
export default function Search({ triggerSize, dictionary }) {
  const isSearchOpen = useStore($isSearchOpen);

  for (const word of dictionary) {
    searchIndex.add({
      id: word.id,
      title: word.data.title,
      slug: word.slug
    });
  }

  return (
    <>
      <SearchTrigger size={triggerSize} />
      { isSearchOpen && <SearchDialog /> }
    </>
  );
}

/**
 * Search Trigger
 * @param {{size: "sm" | "md"}} props 
 */
function SearchTrigger({ size = "md" }) {
  const isSearchOpen = useStore($isSearchOpen);
  const isMacOS = useIsMacOS();

  // Ctrl+K - keybind
  useEffect(() => {
    document.addEventListener("keydown", handleOpenSearch);
    function handleOpenSearch(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        $isSearchOpen.set(!isSearchOpen);
      }
    }
    return () => document.removeEventListener("keydown", handleOpenSearch);
  }, []);

  if (size === "sm") return (
    <div onClick={() => $isSearchOpen.set(!isSearchOpen)}>
      <div className="relative w-56 text-sm hidden md:flex items-center justify-between border pl-2.5 p-1 space-x-2 border-gray-400 rounded-lg cursor-text">
        <div className="flex items-center text-gray-400 space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <span className="focus:outline-none truncate">Search word</span>			
        </div>	
        <kbd className="text-gray-600 py-1 px-2 rounded-md border border-gray-400 ml-auto bg-gray-100">
          {isMacOS ? (
            <><span className="text-sm mr-0.5">⌘</span>K</>
          ) : (
            <>CTRL+K</>
          )}
        </kbd>
      </div>
      <button className="flex md:hidden font-bold">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
				</svg>
			</button>
    </div>
  );

  return (
    <div onClick={() => $isSearchOpen.set(!isSearchOpen)}
      className="relative flex items-center justify-between mt-2 border pl-3 p-1 md:pl-5 md:pr-2 md:py-2 space-x-3 border-gray-400 rounded-lg hover:shadow cursor-text"
    >
      <div className="flex items-center text-gray-400 space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <span className="focus:outline-none text-sm sm:text-base md:text-lg truncate">
          Search words
        </span>			
      </div>	
      <kbd className="text-gray-600 rounded-md p-1 md:px-4 md:py-2 text-sm sm:text-base border border-gray-400 bg-gray-100">
        {isMacOS ? (
          <><span className="text-sm mr-0.5">⌘</span>K</>
        ) : (
          <>CTRL+K</>
        )}
      </kbd>
    </div>
  );
}

/**
 * Search Dialog
 * @todo implement search term debouncing
 * @todo implement visual que buttons (↑ ↓ ↵) for keyboard navigation on search dialog component
 */
function SearchDialog() {
  useLockBody();
  const router = useRouter();
  const isSearchOpen = useStore($isSearchOpen);
  const [cursor, setCursor] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    const [ search ] = searchIndex.search(searchTerm, { enrich: true });
    setSearchResult(search?.result);
  }, [searchTerm])

  // Escape - keybind
  useEffect(() => {
    document.addEventListener("keydown", handleCloseSearch);
    function handleCloseSearch(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        $isSearchOpen.set(!isSearchOpen);
      }
    }
    return () => document.removeEventListener("keydown", handleCloseSearch);
  }, []);

  // Arrow Up/Down & Enter - keybind
  function handleKeyboardCtrl(e) {
    const resultsCount = searchResult?.length || 0;
    if (resultsCount && e.key === "ArrowUp") {
      e.preventDefault();
      setCursor(cursor === 0 ? Math.min(resultsCount - 1, resultsCount) : cursor - 1);
    }
    if (resultsCount && e.key === "ArrowDown") {
      e.preventDefault();
      setCursor(cursor === Math.min(resultsCount - 1, resultsCount) ? 0 : cursor + 1);
    }
    if (resultsCount && e.key === "Enter") {
      e.preventDefault();
      if (document.querySelector("._cursor")) {
        const word = document.querySelector("._cursor");
        router.push(word.href);
      }
    }
  };

  return (
    <div className="fixed left-0 top-0 z-auto p-5 w-full h-screen flex justify-center bg-gray-100/30">
      {/* Blur */}
      <div onClick={() => $isSearchOpen.set(!isSearchOpen)}
        className="absolute w-full h-full left-0 top-0 z-50 backdrop-blur-sm"
      />

      <div className="flex flex-col bg-white h-fit max-w-5xl max-h-full w-full shadow-xl z-50 border rounded-lg overflow-hidden"
        onMouseMove={() => cursor !== -1 && setCursor(-1)}
      >
        {/* Form Field */}
        <div className="relative z-50 flex items-center space-x-3 border-b pl-2 p-1 md:pl-4 md:pr-2 md:py-2 ">
          <div className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 md:w-6 md:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {/* <div className="flex-none h-4 w-4 md:w-6 md:h-6 rounded-full border-2 border-gray-400 border-b-gray-200 border-r-gray-200 animate-spin" /> */}
          </div>		
          <input 
            autoFocus
            type="text"
            value={searchTerm}
            onKeyDown={handleKeyboardCtrl}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full bg-transparent text-gray-600 focus:outline-none text-base md:text-lg"
          />
          <kbd 
            onClick={() => $isSearchOpen.set(!isSearchOpen)}
            className="text-gray-600 rounded-md px-2 py-1 md:px-4 md:py-2 text-sm sm:text-base border bg-gray-100 cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        {/* Suggestions/Results/Recent etc. */}
        <>
          {searchTerm.length < 1 ? (
            <SearchInfo />
          ) : (
            <SearchResult result={searchResult} cursor={cursor} searchTerm={searchTerm} />
          )}
        </>
      </div>
    </div>
  );
}

/**
 * Default Search Text Placeholder
 * @todo implement recent search term list
 */
const SearchInfo = () => (
  <p className="block w-full text-sm md:text-base px-2 py-1 md:px-4 md:py-2 text-slate-500 font-normal leading-6">
    Type a word to search
  </p>
);

/**
 * Search result
 * @param {{ result: Array<{ id: number, doc: { title: string, slug: string }, searchTerm: string }> }} props
 */
function SearchResult({ result = [], cursor, searchTerm }) { 
  const router = useRouter();

  return (
    <div className="block w-full text-sm md:text-base overflow-y-scroll scrollbar">
      {result.length < 1 && searchTerm.length >= 1 ? (
        /**
         * @todo add message suggesting adding/contributing the word to dictionary
         */
        // <p className="p-2 md:p-4">No Result found</p>
        <SearchSuggestionContribution searchTerm={searchTerm}/>
      ) : ( 
        result.map(({ doc }, i) => (
          <a key={i}
            /**
             * @todo find better ways - don't hardcode `browse` string to the word slug
             */
            href={`/browse/${doc.slug}`}  
            onClick={(e) => {
              e.preventDefault();
              router.push(e.currentTarget.href);
            }}
            className={`${cursor === i && "bg-gray-100 _cursor"} flex items-center justify-between no-underline w-full p-2 md:p-4 hover:bg-gray-100`}
          >
            <span>{ doc.title }</span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-2.5 h-2.5 md:w-4 md:h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          </a>
        ))
      )}
    </div>
  );
}

function SearchSuggestionContribution({ searchTerm }){
  return (
    <section className="rounded-lg border shadow-sm">
      <div className="space-y-1.5 p-3 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold tracking-tight text-2xl">
            No Result found for{" "}
            <span className="font-medium">{searchTerm}</span>
          </h3>
          <p className="text-sm">
            Help add the word <span className="font-medium">{searchTerm}</span>{" "}
            to jargon.dev.
          </p>
        </div>
        <a
          className="flex items-center w-fit justify-center no-underline px-4 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 text-sm shadow-sm hover:shadow transition-colors"
          href="/editor/new"
        >
          <span>Start Now</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}