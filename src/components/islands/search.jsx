import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $isSearchOpen } from "../../stores/search.js";
import useIsMacOS from "../../hooks/use-is-mac-os.js";
import useLockBody from "../../hooks/use-lock-body.js";
import Document from "../../../node_modules/flexsearch/dist/module/document";

const index = new Document({
  cache: 100,
  document: { 
    index: "title",
    store: ["title", "url"] 
  },
  tokenize: "full"
});

/**
 * Search Component Island
 * @param {{ triggerSize: "sm" | "md", dictionary: MarkdownInstance<Record<string, any>>[] }} props 
 */
export default function Search({ triggerSize, dictionary }) {
  const isSearchOpen = useStore($isSearchOpen);

  return (
    <>
      <SearchTrigger size={triggerSize} />
      { isSearchOpen && <SearchDialog dictionary={dictionary} /> }
    </>
  )
}

/**
 * Search Trigger
 * @param {{size: "sm" | "md"}} props 
 */
function SearchTrigger({ size = "md" }) {
  const isSearchOpen = useStore($isSearchOpen);
  const isMac = useIsMacOS();

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
      <div className="relative w-56 text-sm hidden md:flex items-center border pl-2.5 p-1 space-x-2 border-gray-400 rounded-lg cursor-text">
        <div className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>	
        <span className="w-full text-gray-600 focus:outline-none truncate">Search word</span>			
        <kbd className="text-gray-600 py-1 px-2 rounded-md border ml-auto bg-gray-400/10">
          { isMac ? "⌘K" : "CTRL+K" }
        </kbd>
      </div>
      <button className="flex md:hidden font-bold">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
				</svg>
			</button>
    </div>
  );

  return (
    <div onClick={() => $isSearchOpen.set(!isSearchOpen)}
      className="relative flex items-center mt-2 border pl-3 p-1 md:pl-5 md:pr-2 md:py-2 space-x-3 border-gray-400 rounded-lg hover:shadow cursor-text"
    >
      <div className="text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="h-4 w-4 md:w-6 md:h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>	
      <span className="w-full text-gray-400 focus:outline-none text-sm sm:text-base md:text-lg truncate">
        Search words
      </span>			
      <kbd className="text-gray-600 rounded-md p-1 md:px-4 md:py-2 text-sm sm:text-base border bg-gray-400/10">
        { isMac ? "⌘K" : "CTRL+K" }
      </kbd>
    </div>
  );
}

/**
 * Search Dialog
 * @param {{ dictionary: import("astro").AstroBuiltinProps }} props
 */
function SearchDialog({ dictionary }) {
  useLockBody();
  const isSearchOpen = useStore($isSearchOpen);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  let idx = 0;
  // indexing dictionary in search engine
  for (const word of dictionary) {
    index.add({
      id: idx,
      title: word.frontmatter.title,
      url: word.url
    });
    idx++;
  }

  useEffect(() => {
    const [ search ] = index.search(searchTerm, { enrich: true });
    // console.log(search?.result);
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

  return (
    <div className="fixed left-0 top-0 z-auto p-5 w-full h-full flex justify-center bg-gray-100/30">
      {/* Blur */}
      <div onClick={() => $isSearchOpen.set(!isSearchOpen)}
        className="absolute w-full h-full left-0 top-0 z-50 backdrop-blur-sm"
      />

      <div className="flex flex-col bg-white h-fit max-w-5xl w-full shadow-xl z-50 border rounded-lg overflow-hidden">
        {/* Form Field */}
        <div className="relative z-50 flex items-center space-x-3 border-b pl-2 p-1 md:pl-4 md:pr-2 md:py-2 ">
          <div className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="h-4 w-4 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {/* <div className="flex-none h-4 w-4 md:w-6 md:h-6 rounded-full border-2 border-gray-400 border-b-gray-200 border-r-gray-200 animate-spin" /> */}
          </div>		
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full bg-transparent text-gray-600 focus:outline-none text-base md:text-lg"
          />
          <kbd 
            onClick={() => $isSearchOpen.set(!isSearchOpen)}
            className="text-gray-600 rounded-md px-2 py-1 md:px-4 md:py-2 text-sm sm:text-base border bg-gray-400/10 cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        {/* Suggestions */}
        <div className="">
          <SearchInfo />
        </div>
      </div>
    </div>
  );
}

/**
 * Default Search Text Placeholder
 */
const SearchInfo = () => (
  <p className="block w-full text-sm md:text-base px-2 py-1 md:px-4 md:py-2 text-slate-500 font-normal leading-6">
    Type a word to search
  </p>
);
