import { useEffect } from "react";
import Markdown from "react-markdown";
import { useStore } from "@nanostores/react";
import useRouter from "../../lib/hooks/use-router.js";
import { capitalizeText } from "../../lib/utils/index.js";
import useWordEditor from "../../lib/hooks/use-word-editor.js";
import {
  $isWordSubmitLoading,
  $isWordSubmitted,
  $togglePreview,
} from "../../lib/stores/dictionary.js";

/**
 * Main Word Editor Component - Island
 */
export default function WordEditor({
  title = "",
  content = "",
  metadata = {},
  action,
}) {
  const togglePreview = useStore($togglePreview);

  return (
    <div className="w-full flex border rounded-lg">
      <Editor
        action={action}
        eTitle={title}
        eContent={content}
        eMetadata={metadata}
        className={` ${!togglePreview ? "flex" : "hidden"} w-full h-full lg:!flex flex-col p-5 border-r`}
      />
      <Preview className="w-full h-full hidden lg:flex flex-col p-5" />
      <Preview
        className={`${togglePreview ? "flex" : "hidden"} w-full h-full lg:!hidden flex-col p-5`}
      />
    </div>
  );
}

/**
 * Detached Editor Submit Button Component - Island
 */
export function SubmitButton({ children = "Submit" }) {
  const isSubmitted = useStore($isWordSubmitted);
  const isSubmitLoading = useStore($isWordSubmitLoading);

  return (
    <button
      className={`flex items-center justify-center no-underline text-white ${isSubmitted ? "bg-green-700" : "bg-gray-900 hover:bg-gray-700"} focus:ring-0 font-medium rounded-lg text-base px-5 py-2.5 text-center`}
      type="submit"
      form="jargons.dev:word_editor"
      disabled={isSubmitLoading || isSubmitted}
    >
      {isSubmitLoading ? (
        <div className="flex-none h-4 w-4 md:w-6 md:h-6 rounded-full border-2 border-gray-400 border-b-gray-200 border-r-gray-200 animate-spin" />
      ) : !isSubmitLoading && isSubmitted ? (
        <svg
          className="h-4 w-4 md:w-6 md:h-6 text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 11.917 9.724 16.5 19 7.5"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

export function TogglePreview() {
  const togglePreview = useStore($togglePreview);

  return (
    <label className="inline-flex lg:hidden items-center cursor-pointer border-r pr-2.5 mr-2.5">
      <span className="me-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        Preview
      </span>
      <input
        type="checkbox"
        className="sr-only peer"
        onChange={() => $togglePreview.set(!togglePreview)}
      />
      <div className="relative w-8 h-5 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[75%] rtl:peer-checked:after:-translate-x-[75%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-black"></div>
    </label>
  );
}

/**
 * Editor Markdown Input Component
 */
function Editor({ eTitle, eContent, eMetadata, className, action, ...props }) {
  const router = useRouter();
  const isSubmitted = useStore($isWordSubmitted);
  const isSubmitLoading = useStore($isWordSubmitLoading);
  const { title, setTitle, content, setContent } = useWordEditor();

  const isDone = isSubmitLoading || isSubmitted;

  useEffect(() => {
    setTitle(eTitle);
    setContent(eContent);
  }, []);

  /**
   * Word Submit Handler
   * @param {import("react").FormEvent} e
   *
   * @todo handle error for when submission isn't successful
   */
  async function handleSubmit(e) {
    $isWordSubmitLoading.set(true);
    const formData = new FormData(e.target);
    const response = await fetch("/api/dictionary", {
      method: "POST",
      body: formData,
    });
    if (response && response.status === 200) {
      $isWordSubmitted.set(true);
      $isWordSubmitLoading.set(false);
      router.push("/editor");
    } else {
      /**
       * Temporary workaround for handling deletion of existing reference/branch
       */
      const data = await response.json();
      $isWordSubmitLoading.set(false);
      if (
        response.status === 422 &&
        data.message.includes("Reference already exists")
      ) {
        if (
          confirm(
            "It appears you have an existing reference for the current word, do you wish to clear that reference?",
          )
        ) {
          $isWordSubmitLoading.set(true);
          const response = await fetch("/api/dictionary", {
            method: "DELETE",
            body: formData,
          });
          if (response.status === 200) {
            $isWordSubmitLoading.set(false);
            alert(
              "Reference cleared successfully! Kindly publish your contribution again!",
            );
          }
        } else {
          router.push("/editor");
        }
      }
    }
  }

  return (
    <form
      className={`${className} relative`}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      id="jargons.dev:word_editor"
      {...props}
    >
      <input
        required
        type="text"
        id="title"
        name="title"
        value={title}
        placeholder="New Word"
        onChange={(e) => setTitle(e.target.value)}
        readOnly={action === "edit" || isDone}
        className={`${(action === "edit" || isDone) && "cursor-not-allowed"} block w-full pb-2 mb-3 text-gray-900 border-b text-lg font-bold focus:outline-none`}
      />
      <textarea
        required
        id="content"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        readOnly={isDone}
        className={`${isDone && "cursor-not-allowed select-none"} w-full h-1 grow resize-none appearance-none border-none focus:outline-none scrollbar`}
      />
      <input type="hidden" id="action" name="action" value={action} />
      {action === "edit" && (
        <input
          type="hidden"
          id="metadata"
          name="metadata"
          value={JSON.stringify(eMetadata)}
        />
      )}
    </form>
  );
}

/**
 * Editor Markdown Preview Component
 */
function Preview({ className, ...props }) {
  const { title, content } = useWordEditor();

  return (
    <div className={`${className} select-none`} {...props}>
      <div className="h-1 grow overflow-auto rounded-lg border p-5 shadow-lg scrollbar">
        <DummyPreviewNavbar />

        <div className="max-w-4xl space-y-8 mx-auto">
          <div className="w-full">
            {title && (
              <h1 className="text-4xl font-black">
                {capitalizeText(title.trim())}
              </h1>
            )}
          </div>

          <article className="w-full max-w-screen-lg prose">
            <Markdown>{content}</Markdown>
          </article>
        </div>
      </div>
    </div>
  );
}

/**
 * Editor Preview Section Dummy Navbar
 */
const DummyPreviewNavbar = () => (
  <div className="@container mb-6">
    <nav className="flex items-center justify-between pb-4">
      <span className="flex items-center underline cursor-not-allowed">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        <span>Back</span>
      </span>

      <div className="cursor-not-allowed">
        <div className="relative w-56 text-sm hidden @md:flex items-center justify-between border pl-2.5 p-1 space-x-2 border-gray-400 rounded-lg">
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
            <>
              <span className="text-sm mr-0.5">⌘</span>K
            </>
          </kbd>
        </div>
        <button className="cursor-not-allowed flex @md:hidden font-bold">
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
        </button>
      </div>
    </nav>
  </div>
);
