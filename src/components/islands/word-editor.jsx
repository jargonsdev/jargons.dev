/**
 * Word Editor Component System - Dictionary Content Creation & Editing
 * @exports WordEditor - Main editor with live preview, form validation, and GitHub integration for dictionary contributions
 * @exports SubmitButton - Detached submit button with loading states and success indicators
 * @exports TogglePreview - Mobile preview toggle for responsive editor experience
 */

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { useStore } from "@nanostores/react";
import useRouter from "../../lib/hooks/use-router.js";
import {
  capitalizeText,
  toggleMarkdownListPrefix,
  continueMarkdownListOnEnter,
  toggleMarkdownWrap,
  toggleMarkdownCodeBlock,
} from "../../lib/utils/index.js";
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
        className={` ${!togglePreview ? "flex" : "hidden"} w-full h-full lg:!flex flex-col py-5 border-r`}
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
  const beforeInputSelection = useRef(null);
  const draftReady = useRef(false);
  const history = useRef({ undo: [], redo: [] });
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
  });
  const draftKey = `jargons.dev:word-editor:${action}:${
    action === "edit" ? encodeURIComponent(eTitle.trim().toLowerCase()) : "new"
  }`;

  useEffect(() => {
    let draft;
    try {
      const savedDraft = window.localStorage.getItem(draftKey);
      draft = savedDraft ? JSON.parse(savedDraft) : null;
    } catch {
      draft = null;
    }

    setTitle(typeof draft?.title === "string" ? draft.title : eTitle);
    setContent(typeof draft?.content === "string" ? draft.content : eContent);
    setInitialContent(eContent);
    history.current = { undo: [], redo: [] };
    draftReady.current = true;
  }, [draftKey]);

  useEffect(() => {
    const backLink = document.querySelector("[data-word-editor-back]");
    if (!backLink) return;

    function handleBackClick(event) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        (title === eTitle && content === eContent)
      ) {
        return;
      }

      event.preventDefault();
      if (
        !window.confirm(
          "You have unsaved changes. Going back will discard this draft. Continue?",
        )
      ) {
        return;
      }

      clearDraft();
      window.location.assign(backLink.href);
    }

    backLink.addEventListener("click", handleBackClick);
    return () => backLink.removeEventListener("click", handleBackClick);
  }, [content, title, eContent, eTitle, draftKey]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const selection = pendingSelection.current;

    if (!textarea || !selection) return;

    textarea.focus();
    textarea.setSelectionRange(selection.start, selection.end);
    pendingSelection.current = null;
  }, [content]);

  function updateHistoryState() {
    setHistoryState({
      canUndo: history.current.undo.length > 0,
      canRedo: history.current.redo.length > 0,
    });
  }

  function recordCurrentContent(selection) {
    const textarea = textareaRef.current;
    history.current.undo.push({
      value: content,
      start: selection?.start ?? textarea?.selectionStart ?? 0,
      end: selection?.end ?? textarea?.selectionEnd ?? 0,
    });
    if (history.current.undo.length > 100) history.current.undo.shift();
    history.current.redo = [];
    updateHistoryState();
  }

  function commitEdit(result) {
    if (result.value === content) return;

    recordCurrentContent();
    pendingSelection.current = result;
    setContent(result.value);
    persistDraft(title, result.value);
  }

  function persistDraft(draftTitle, draftContent) {
    if (!draftReady.current) return;

    try {
      if (draftTitle === eTitle && draftContent === eContent) {
        window.localStorage.removeItem(draftKey);
        return;
      }

      window.localStorage.setItem(
        draftKey,
        JSON.stringify({ title: draftTitle, content: draftContent }),
      );
    } catch {
      // Draft persistence is best-effort when browser storage is unavailable.
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // Ignore unavailable browser storage.
    }
  }

  function handleTitleChange(event) {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    persistDraft(nextTitle, content);
  }

  function handleTextareaBeforeInput(event) {
    beforeInputSelection.current = {
      start: event.currentTarget.selectionStart,
      end: event.currentTarget.selectionEnd,
    };
  }

  function handleTextareaChange(event) {
    const nextContent = event.currentTarget.value;

    if (nextContent !== content) {
      recordCurrentContent(beforeInputSelection.current);
      persistDraft(title, nextContent);
    }

    beforeInputSelection.current = null;
    setContent(nextContent);
  }

  function applyHistory(direction) {
    const source = history.current[direction];
    if (isDone || source.length === 0) return;

    const textarea = textareaRef.current;
    const target = direction === "undo" ? "redo" : "undo";
    history.current[target].push({
      value: content,
      start: textarea?.selectionStart ?? 0,
      end: textarea?.selectionEnd ?? 0,
    });
    pendingSelection.current = source.pop();
    setContent(pendingSelection.current.value);
    persistDraft(title, pendingSelection.current.value);
    updateHistoryState();
  }

  function applyMarkdownWrap(marker) {
    const textarea = textareaRef.current;
    if (!textarea || isDone) return;

    const result = toggleMarkdownWrap(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
      marker,
    );
    commitEdit(result);
  }

  function applyMarkdownCodeBlock() {
    const textarea = textareaRef.current;
    if (!textarea || isDone) return;

    const result = toggleMarkdownCodeBlock(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
    );
    commitEdit(result);
  }

  function applyMarkdownListPrefix(prefix) {
    const textarea = textareaRef.current;
    if (!textarea || isDone) return;

    const result = toggleMarkdownListPrefix(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
      prefix,
    );
    commitEdit(result);
  }

  function handleTextareaKeyDown(event) {
    if (isDone) return;

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const { selectionStart, selectionEnd, value } = event.currentTarget;
      const result = continueMarkdownListOnEnter(
        value,
        selectionStart,
        selectionEnd,
      );

      if (result) {
        event.preventDefault();
        commitEdit(result);
        return;
      }
    }

    if ((!event.ctrlKey && !event.metaKey) || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "z" || key === "y") {
      event.preventDefault();
      applyHistory(key === "y" || event.shiftKey ? "redo" : "undo");
      return;
    }

    if (event.shiftKey) return;

    const markerByKey = {
      b: "**",
      i: "_",
    };
    const marker = markerByKey[key];

    if (!marker) return;

    event.preventDefault();
    applyMarkdownWrap(marker);
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
      clearDraft();
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
        placeholder="New word here..."
        onChange={handleTitleChange}
        readOnly={action === "edit" || isDone}
        className={`${(action === "edit" || isDone) && "cursor-not-allowed"} block w-full pb-2 px-5 text-gray-900 border-b text-lg font-bold focus:outline-none`}
      />
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b px-3 mb-3 bg-white py-2"
        role="toolbar"
        aria-label="Markdown formatting"
      >
        {/* TEMPORARILY DISABLED UNDO/REDO BUTTONS */}
        {/* <ToolbarButton
          label="Undo"
          disabled={isDone || !historyState.canUndo}
          onClick={() => applyHistory("undo")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2"
          />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={isDone || !historyState.canRedo}
          onClick={() => applyHistory("redo")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15 14 5-5-5-5m5 5H10a6 6 0 0 0 0 12h2"
          />
        </ToolbarButton> */}
        <ToolbarButton
          label="Bold (Ctrl+B)"
          disabled={isDone}
          onClick={() => applyMarkdownWrap("**")}
        >
          <path
            strokeLinejoin="round"
            d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z"
          />
        </ToolbarButton>
        <ToolbarButton
          label="Italic (Ctrl+I)"
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
        placeholder="Write the word definition here..."
        onBeforeInput={handleTextareaBeforeInput}
        onChange={handleTextareaChange}
        onKeyDown={handleTextareaKeyDown}
        readOnly={isDone}
        className={`${isDone && "cursor-not-allowed select-none"} w-full h-1 px-5 grow resize-none font-mono appearance-none border-none focus:outline-none scrollbar`}
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
            <Markdown remarkPlugins={[remarkBreaks]}>{content}</Markdown>
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
      <span className="flex items-center w-6 h-6 justify-center bg-none hover:bg-black text-black hover:text-white rounded-full border border-black/60 transition-color ease-in-out duration-400 cursor-not-allowed">
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
