/**
 * Word Editor Component System - Dictionary Content Creation & Editing
 * @exports WordEditor - Main editor with live preview, form validation, and GitHub integration for dictionary contributions
 * @exports SubmitButton - Detached submit button with loading states and success indicators
 * @exports TogglePreview - Mobile preview toggle for responsive editor experience
 */

import { useEffect, useRef } from "react";
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
    <div className="w-full flex border rounded-xl">
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
      className={`flex items-center justify-center no-underline text-white ${isSubmitted ? "bg-green-700" : "bg-gray-900 hover:bg-gray-700"} focus:ring-0 font-medium rounded-xl text-base px-5 py-2.5 text-center`}
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
  const {
    title,
    setTitle,
    content,
    setContent,
    initialContent,
    setInitialContent,
  } = useWordEditor();

  const isDone = isSubmitLoading || isSubmitted;
  const textareaRef = useRef(null);
  const pendingSelection = useRef(null);

  useEffect(() => {
    setTitle(eTitle);
    setContent(eContent);
    setInitialContent(eContent);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    const selection = pendingSelection.current;

    if (!textarea || !selection) return;

    textarea.focus();
    textarea.setSelectionRange(selection.start, selection.end);
    pendingSelection.current = null;
  }, [content]);

  function applyMarkdownWrap(marker) {
    const textarea = textareaRef.current;
    if (!textarea || isDone) return;

    const result = wrapSelection(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
      marker,
    );
    pendingSelection.current = result;
    setContent(result.value);
  }

  function applyMarkdownCodeBlock() {
    const textarea = textareaRef.current;
    if (!textarea || isDone) return;

    const result = wrapSelectionInCodeBlock(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
    );
    pendingSelection.current = result;
    setContent(result.value);
  }

  function applyMarkdownListPrefix(prefix) {
    const textarea = textareaRef.current;
    if (!textarea || isDone) return;

    const result = prefixSelectedLines(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
      prefix,
    );
    pendingSelection.current = result;
    setContent(result.value);
  }

  /**
   * Word Submit Handler
   * @param {import("react").FormEvent} e
   *
   * @todo handle error for when submission isn't successful
   */
  async function handleSubmit(e) {
    const hasWordChanged = content !== initialContent;
    if (!hasWordChanged) {
      alert(
        "No changes detected. Please update the content before submitting.",
      );
      return;
    }

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
          if (response.status === 204) {
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
        className={`${(action === "edit" || isDone) && "cursor-not-allowed"} block w-full pb-2 text-gray-900 border-b text-lg font-bold focus:outline-none`}
      />
      <div
        className="sticky top-0 z-10 flex items-center gap-1 border-b mb-3 bg-white py-2"
        role="toolbar"
        aria-label="Markdown formatting"
      >
        <ToolbarButton
          label="Bold"
          disabled={isDone}
          onClick={() => applyMarkdownWrap("**")}
        >
          <path
            strokeLinejoin="round"
            d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z"
          />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          disabled={isDone}
          onClick={() => applyMarkdownWrap("_")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803"
          />
        </ToolbarButton>
        <ToolbarButton
          label="Bulleted list"
          disabled={isDone}
          onClick={() => applyMarkdownListPrefix("- ")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          disabled={isDone}
          onClick={() => applyMarkdownListPrefix("1. ")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99"
          />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          disabled={isDone}
          onClick={() => applyMarkdownWrap("`")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8 17-5-5 5-5m8 0 5 5-5 5m-2-13-4 16"
          />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          disabled={isDone}
          onClick={applyMarkdownCodeBlock}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
          />
        </ToolbarButton>
      </div>
      <textarea
        ref={textareaRef}
        required
        id="content"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        readOnly={isDone}
        className={`${isDone && "cursor-not-allowed select-none"} w-full h-1 grow resize-none font-mono md:text-lg appearance-none border-none focus:outline-none scrollbar`}
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
 * Editor Markdown Input Toolbar Button Component
 */
function ToolbarButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}

function wrapSelection(value, start, end, marker) {
  const selectedText = value.slice(start, end);
  const wrappedText = `${marker}${selectedText}${marker}`;

  if (start === end) {
    const cursor = start + marker.length;
    return {
      value: `${value.slice(0, start)}${wrappedText}${value.slice(end)}`,
      start: cursor,
      end: cursor,
    };
  }

  const selectionStart = start + marker.length;
  return {
    value: `${value.slice(0, start)}${wrappedText}${value.slice(end)}`,
    start: selectionStart,
    end: selectionStart + selectedText.length,
  };
}

function wrapSelectionInCodeBlock(value, start, end) {
  const selectedText = value.slice(start, end);
  const leadingNewline = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
  const fence = "```";
  const openingFence = `${leadingNewline}${fence}\n`;
  const closingFence = `${selectedText.endsWith("\n") ? "" : "\n"}${fence}${
    end < value.length && value[end] !== "\n" ? "\n" : ""
  }`;
  const insertedText = `${openingFence}${selectedText}${closingFence}`;
  const selectionStart = start + openingFence.length;

  return {
    value: `${value.slice(0, start)}${insertedText}${value.slice(end)}`,
    start: selectionStart,
    end: selectionStart + selectedText.length,
  };
}

function prefixSelectedLines(value, start, end, prefix) {
  const firstLineStart = value.lastIndexOf("\n", start - 1) + 1;

  if (start === end) {
    const cursor = start + prefix.length;
    return {
      value: `${value.slice(0, firstLineStart)}${prefix}${value.slice(firstLineStart)}`,
      start: cursor,
      end: cursor,
    };
  }

  const lastLineStart = value.lastIndexOf("\n", end - 2) + 1;
  const lineStarts = [firstLineStart];
  let lineStart = firstLineStart;

  while (lineStart < lastLineStart) {
    const newlineIndex = value.indexOf("\n", lineStart);
    if (newlineIndex === -1) break;

    lineStart = newlineIndex + 1;
    lineStarts.push(lineStart);
  }

  let updatedValue = value;
  for (const index of [...lineStarts].reverse()) {
    updatedValue = `${updatedValue.slice(0, index)}${prefix}${updatedValue.slice(index)}`;
  }

  const prefixesBeforeEnd = lineStarts.filter((index) => index < end).length;
  return {
    value: updatedValue,
    start: start + prefix.length,
    end: end + prefix.length * prefixesBeforeEnd,
  };
}

/**
 * Editor Markdown Preview Component
 */
function Preview({ className, ...props }) {
  const { title, content } = useWordEditor();

  return (
    <div className={`${className} select-none`} {...props}>
      <div className="h-1 grow overflow-auto rounded-xl border p-5 shadow-lg scrollbar">
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
        <div className="relative w-56 text-sm hidden @md:flex items-center justify-between border pl-2.5 p-1 space-x-2 border-gray-400 rounded-xl">
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
          <kbd className="text-gray-600 py-1 px-2 rounded-lg border border-gray-400 ml-auto bg-gray-100">
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
