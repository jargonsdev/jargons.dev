/**
 * Search Component - Dictionary Search Interface with Keyboard Navigation
 *
 * @exports Search - Main search component with FlexSearch integration, modal state, and dictionary indexing
 * @exports SearchTrigger - Trigger button/input with responsive variants and keyboard shortcut hints
 * @exports SearchDialog - Modal search interface with input field, keyboard navigation, and live results
 * @exports SearchInfo - Default placeholder component when no input is provided
 * @exports SearchResult - Search results list with cursor navigation and jAI fallback
 */

import { buildWordPathname, buildWordSlug } from "../../lib/utils/index.js";
import Flexsearch from "flexsearch";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import useRouter from "../../lib/hooks/use-router.js";
import useIsMacOS from "../../lib/hooks/use-is-mac-os.js";
import useLockBody from "../../lib/hooks/use-lock-body.js";
import { $isSearchOpen } from "../../lib/stores/search.js";
import { JAIWordSearchTrigger as SearchWithJAI } from "../../../apps/jai/components/word-search.jsx";

// Create Search Index
const searchIndex = new Flexsearch.Document({
  cache: 100,
  document: {
    index: "title",
    store: ["title", "slug"],
  },
  tokenize: "full",
});

/**
 * Main Search Component Island
 * Integrates FlexSearch indexing with dictionary entries,
 * controls modal state, and renders trigger + dialog.
 *
 * @component
 * @param {Object} props
 * @param {"sm" | "md"} props.triggerSize - Size of the search trigger
 * @param {MarkdownInstance<Record<string, any>>[]} props.dictionary - Words to index and search
 * @returns {JSX.Element}
 */
export default function Search({ triggerSize, dictionary }) {
  const isSearchOpen = useStore($isSearchOpen);

  for (const word of dictionary) {
    searchIndex.add({
      /**
       * `word.id` could be a `slug` or a `slug` with the `mdx` extension i.e. `word-id.mdx`
       * @see https://github.com/withastro/astro/issues/14073
       */
      id: word.id,
      title: word.data.title,
      slug: buildWordPathname(buildWordSlug(word.id)),
    });
  }

  return (
    <>
      <SearchTrigger size={triggerSize} />
      {isSearchOpen && <SearchDialog />}
    </>
  );
}

/**
 * Search Trigger Component
 *
 * Responsive trigger button/input that opens the search dialog.
 * Displays keyboard shortcut hint (Ctrl+K or ⌘K).
 *
 * @component
 * @param {Object} props
 * @param {"sm" | "md"} [props.size="md"] - Trigger size variant
 * @returns {JSX.Element}
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

  if (size === "sm")
    return (
      <div onClick={() => $isSearchOpen.set(!isSearchOpen)}>
        <div className="relative w-56 text-sm hidden @lg:flex items-center justify-between border pl-2.5 p-1 space-x-2 border-gray-400 rounded-lg cursor-text">
          <div className="flex items-center text-gray-400 space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <span className="focus:outline-none truncate">Search word</span>
          </div>
          <kbd className="text-gray-600 py-1 px-2 rounded-md border border-gray-400 ml-auto bg-gray-100">
            {isMacOS ? (
              <>
                <span className="text-sm mr-0.5">⌘</span>K
              </>
            ) : (
              <>CTRL+K</>
            )}
          </kbd>
        </div>
        <button className="flex @lg:hidden font-bold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>
    );

  return (
    <div
      onClick={() => $isSearchOpen.set(!isSearchOpen)}
      className="relative flex items-center justify-between mt-2 border pl-3 p-1 md:pl-5 md:pr-2 md:py-2 space-x-3 border-gray-400 rounded-lg hover:shadow cursor-text"
    >
      <div className="flex items-center text-gray-400 space-x-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-4 w-4 md:w-6 md:h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <span className="focus:outline-none text-sm sm:text-base md:text-lg truncate">
          Search words
        </span>
      </div>
      <kbd className="text-gray-600 rounded-md p-1 md:px-4 md:py-2 text-sm sm:text-base border border-gray-400 bg-gray-100">
        {isMacOS ? (
          <>
            <span className="text-sm mr-0.5">⌘</span>K
          </>
        ) : (
          <>CTRL+K</>
        )}
      </kbd>
    </div>
  );
}

/**
 * Search Dialog Component
 *
 * Full-screen modal interface with search input,
 * FlexSearch results, AI fallback, and keyboard navigation.
 *
 * @component
 * @returns {JSX.Element}
 *
 * @todo Implement search term debouncing
 * @todo Implement visual que buttons (↑ ↓ ↵) for keyboard navigation on search dialog component
 */
function SearchDialog() {
  useLockBody();
  const router = useRouter();
  const isSearchOpen = useStore($isSearchOpen);
  const [cursor, setCursor] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    const [search] = searchIndex.search(searchTerm, { enrich: true });
    setSearchResult(search?.result);
  }, [searchTerm]);

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
    // Results count - if no results, but search term exists, allow AskJAI search option cursor navigation
    const resultsCount =
      searchResult?.length || (searchTerm.length >= 1 ? 1 : 0);
    if (resultsCount && e.key === "ArrowUp") {
      e.preventDefault();
      setCursor(
        cursor === 0 ? Math.min(resultsCount - 1, resultsCount) : cursor - 1,
      );
    }
    if (resultsCount && e.key === "ArrowDown") {
      e.preventDefault();
      setCursor(
        cursor === Math.min(resultsCount - 1, resultsCount) ? 0 : cursor + 1,
      );
    }
    if (resultsCount && e.key === "Enter") {
      e.preventDefault();
      if (document.querySelector("._cursor")) {
        const word = document.querySelector("._cursor");
        router.push(word.href);
      }
    }
  }

  // Update search term state on input change and reset cursor
  function handleSearchTermChange(e) {
    setSearchTerm(e.target.value);
    setCursor(-1);
  }

  return (
    <div className="fixed left-0 top-0 z-50 p-5 w-full h-screen flex justify-center bg-gray-100/30">
      {/* Blur */}
      <div
        onClick={() => $isSearchOpen.set(!isSearchOpen)}
        className="absolute w-full h-full left-0 top-0 z-50 backdrop-blur-sm"
      />

      <div
        className="flex flex-col bg-white h-fit max-w-5xl max-h-full w-full shadow-xl z-50 border rounded-lg overflow-hidden"
        onMouseMove={() => cursor !== -1 && setCursor(-1)}
      >
        {/* Form Field */}
        <div className="relative z-50 flex items-center space-x-3 border-b pl-2 p-1 md:pl-4 md:pr-2 md:py-2 ">
          <div className="text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4 md:w-6 md:h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            {/* <div className="flex-none h-4 w-4 md:w-6 md:h-6 rounded-full border-2 border-gray-400 border-b-gray-200 border-r-gray-200 animate-spin" /> */}
          </div>
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onKeyDown={handleKeyboardCtrl}
            onChange={handleSearchTermChange}
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
            <SearchResult
              result={searchResult}
              cursor={cursor}
              searchTerm={searchTerm}
            />
          )}
        </>
      </div>
    </div>
  );
}

/**
 * Search Info Component
 *
 * Placeholder text shown when no search term is entered.
 *
 * @component
 * @returns {JSX.Element}
 *
 * @todo Implement recent search term list
 */
const SearchInfo = () => (
  <p className="block w-full text-sm md:text-base px-2 py-1 md:px-4 md:py-2 text-slate-500 font-normal leading-6">
    Type a word to search
  </p>
);

/**
 * Search Result Component
 *
 * Displays FlexSearch results or jAI fallback when no matches are found.
 * Supports cursor-based keyboard navigation.
 *
 * @component
 * @param {Object} props
 * @param {Array<{ id: number, doc: { title: string, slug: string } }>} props.result - Search results
 * @param {number} props.cursor - Current cursor index for keyboard navigation
 * @param {string} props.searchTerm - Current search input
 * @returns {JSX.Element}
 */
function SearchResult({ result = [], cursor, searchTerm }) {
  const router = useRouter();

  return (
    <div className="block w-full text-sm md:text-base overflow-y-auto scrollbar">
      {result.length < 1 && searchTerm.length >= 1 ? (
        <SearchWithJAI word={searchTerm} cursor={cursor} />
      ) : (
        result.map(({ doc }, i) => (
          <a
            key={i}
            href={doc.slug}
            onClick={(e) => {
              e.preventDefault();
              router.push(e.currentTarget.href);
            }}
            className={`${cursor === i && "bg-gray-100 _cursor"} flex items-center justify-between no-underline w-full p-2 md:p-4 hover:bg-gray-100`}
          >
            <span>{doc.title}</span>
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-2.5 h-2.5 md:w-4 md:h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </span>
          </a>
        ))
      )}
    </div>
  );
}
