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
  $forkSyncStatus,
  $togglePreview,
} from "../../lib/stores/dictionary.js";

function hasValidSubmissionContent(title, content, initialContent) {
  return (
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    content !== initialContent
  );
}

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
        className={` ${!togglePreview ? "flex" : "hidden"} w-full h-full lg:!flex flex-col py-5 lg:border-r`}
      />
      <Preview className="w-full h-full hidden lg:flex flex-col p-5" />
      <Preview
        className={`${togglePreview ? "flex" : "hidden"} w-full h-full lg:!hidden flex-col p-5`}
      />
    </div>
  );
}

/**
 * Fork readiness and detached submit controls
 */
export function EditorActions({ children = "Submit" }) {
  const forkStatus = useStore($forkSyncStatus);
  const [forkError, setForkError] = useState("");
  const { title, content, initialContent } = useWordEditor();
  const isSubmissionContentValid = hasValidSubmissionContent(
    title,
    content,
    initialContent,
  );

  async function loadForkStatus() {
    $forkSyncStatus.set("checking");
    setForkError("");

    try {
      const response = await fetch("/api/fork");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? "Could not check fork status.");

      $forkSyncStatus.set(data.status);
    } catch (error) {
      $forkSyncStatus.set("error");
      setForkError(error.message ?? "Could not check fork status.");
    }
  }

  useEffect(() => {
    loadForkStatus();
  }, []);

  async function updateFork() {
    $forkSyncStatus.set("syncing");
    setForkError("");

    try {
      const response = await fetch("/api/fork", { method: "POST" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? "Could not update fork.");

      $forkSyncStatus.set(data.status);
      if (data.status === "out-of-date") {
        setForkError("Fork is still out of date. Try updating again.");
      }
    } catch (error) {
      $forkSyncStatus.set("out-of-date");
      setForkError(error.message ?? "Could not update fork.");
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex min-w-0 items-center justify-between gap-2 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-6px_18px_rgba(0,0,0,0.08)] lg:static lg:justify-end lg:gap-x-2 lg:gap-y-1 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
      <div
        className="min-w-0 max-w-[38vw] whitespace-nowrap text-xs md:max-w-none"
        aria-live="polite"
      >
        {(forkStatus === "checking" || forkStatus === "syncing") && (
          <span
            className="inline-flex items-center flex-row-reverse lg:flex-row text-gray-600"
            role="status"
            aria-label={
              forkStatus === "checking"
                ? "Checking fork status"
                : "Updating fork"
            }
            title={
              forkStatus === "checking"
                ? "Checking fork status"
                : "Updating fork"
            }
          >
            <span className="relative inline-flex size-6 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute inset-0 size-6 animate-spin"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.2"
                />
                <path
                  d="M12 3a9 9 0 0 1 9 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="size-3.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7v5l3 2"
                />
              </svg>
            </span>
            <span className="sr-only">
              {forkStatus === "checking"
                ? "Checking fork status"
                : "Updating fork"}
            </span>
          </span>
        )}
        {(forkStatus === "current" || forkStatus === "missing") && (
          <span
            className="flex items-center flex-row-reverse lg:flex-row gap-1 text-green-400"
            role="status"
            aria-label={
              forkStatus === "current"
                ? "Fork is up to date"
                : "Fork created on first submission"
            }
            title={
              forkStatus === "current"
                ? "Fork is up to date"
                : "Fork will be created on first submission"
            }
          >
            <span>All set!</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
        {forkStatus === "out-of-date" && (
          <span className="flex items-center flex-row-reverse lg:flex-row gap-1 text-amber-700">
            <button
              type="button"
              onClick={updateFork}
              className="font-medium underline underline-offset-2"
            >
              Click to ready the fork
            </button>
            <span
              className="inline-flex items-center"
              role="status"
              aria-label="Fork is out of date"
              title={forkError || "Out of date"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Out of date</span>
            </span>
            {forkError && (
              <span className="max-w-[24vw] truncate" title={forkError}>
                {forkError}
              </span>
            )}
          </span>
        )}
        {forkStatus === "error" && (
          <span className="flex items-center flex-row-reverse lg:flex-row gap-1 text-red-700">
            <button
              type="button"
              onClick={loadForkStatus}
              className="font-medium underline underline-offset-2"
            >
              Retry
            </button>
            <span
              className="max-w-[24vw] truncate"
              title={forkError || "Could not check fork status"}
            >
              {forkError || "Check failed"}
            </span>
          </span>
        )}
      </div>
      <SubmitButton isSubmissionValid={isSubmissionContentValid}>
        {children}
      </SubmitButton>
    </div>
  );
}

function SubmitButton({ children = "Submit", isSubmissionValid }) {
  const isSubmitted = useStore($isWordSubmitted);
  const isSubmitLoading = useStore($isWordSubmitLoading);
  const forkStatus = useStore($forkSyncStatus);
  const isForkNotReady = ["checking", "out-of-date", "syncing"].includes(
    forkStatus,
  );

  return (
    <button
      className={`flex items-center justify-center no-underline text-white ${isSubmitted ? "bg-green-700" : "bg-gray-900 hover:bg-gray-700"} focus:ring-0 font-medium rounded-xl text-sm md:text-base px-3 md:px-4 py-2 text-center disabled:cursor-not-allowed disabled:opacity-50`}
      type="submit"
      form="jargons.dev:word_editor"
      disabled={
        isSubmitLoading || isSubmitted || isForkNotReady || !isSubmissionValid
      }
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

/**
 * Editor Preview Toggle Component
 */
export function TogglePreview() {
  const togglePreview = useStore($togglePreview);

  return (
    <label className="inline-flex lg:hidden items-center cursor-pointer">
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
    if (
      ["checking", "out-of-date", "syncing"].includes($forkSyncStatus.get())
    ) {
      return;
    }

    if (!hasValidSubmissionContent(title, content, initialContent)) {
      if (content === initialContent) {
        alert(
          "No changes detected. Please update the content before submitting.",
        );
      }
      return;
    }

    $isWordSubmitLoading.set(true);
    const formData = new FormData(e.target);
    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        body: formData,
      });
      if (response.status === 200) {
        clearDraft();
        $isWordSubmitted.set(true);
        $isWordSubmitLoading.set(false);
        router.push("/editor");
      } else {
        const data = await response.json();
        if (response.status === 409 && data.status === "out-of-date") {
          $forkSyncStatus.set("out-of-date");
          alert(data.message);
          $isWordSubmitLoading.set(false);
          return;
        }

        /**
         * Temporary workaround for handling deletion of existing reference/branch
         */
        if (
          response.status === 422 &&
          data.message?.includes("Reference already exists")
        ) {
          if (
            confirm(
              "It appears you have an existing reference for the current word, do you wish to clear that reference?",
            )
          ) {
            const deleteResponse = await fetch("/api/dictionary", {
              method: "DELETE",
              body: formData,
            });
            if (deleteResponse.status === 204) {
              alert(
                "Reference cleared successfully! Kindly publish your contribution again!",
              );
            } else {
              const deleteData = await deleteResponse.json();
              alert(
                deleteData.message ?? "Could not clear the existing reference.",
              );
            }
          } else {
            router.push("/editor");
          }
        } else {
          alert(data.message ?? "Could not submit this contribution.");
        }
        $isWordSubmitLoading.set(false);
      }
    } catch (error) {
      $isWordSubmitLoading.set(false);
      alert(error.message ?? "Could not submit this contribution.");
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
          <path d="M9 14 4 9l5-5"/>
          <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={isDone || !historyState.canRedo}
          onClick={() => applyHistory("redo")}
        >
          <path d="m15 14 5-5-5-5"/>
          <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/>
        </ToolbarButton> */}
        <ToolbarButton
          label="Bold (Ctrl+B)"
          disabled={isDone}
          onClick={() => applyMarkdownWrap("**")}
        >
          <path d="M6 12h9a4 4 0 010 8H7a1 1 0 01-1-1V5a1 1 0 011-1h7a4 4 0 010 8" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic (Ctrl+I)"
          disabled={isDone}
          onClick={() => applyMarkdownWrap("_")}
        >
          <line x1="19" x2="10" y1="4" y2="4" />
          <line x1="14" x2="5" y1="20" y2="20" />
          <line x1="15" x2="9" y1="4" y2="20" />
        </ToolbarButton>
        <ToolbarButton
          label="Bulleted list"
          disabled={isDone}
          onClick={() => applyMarkdownListPrefix("- ")}
        >
          <g stroke="currentColor" stroke-linecap="round">
            <path d="M3 5h.01" />
            <path d="M3 12h.01" />
            <path d="M3 19h.01" />
            <path d="M8 5h13" />
            <path d="M8 12h13" />
            <path d="M8 19h13" />
          </g>
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          disabled={isDone}
          onClick={() => applyMarkdownListPrefix("1. ")}
        >
          <path d="M11 5h10" />
          <path d="M11 12h10" />
          <path d="M11 19h10" />
          <path d="M4 4h1v5" />
          <path d="M4 9h2" />
          <path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          disabled={isDone}
          onClick={() => applyMarkdownWrap("`")}
        >
          <path d="m18 16 4-4-4-4" />
          <path d="m6 8-4 4 4 4" />
          <path d="m14.5 4-5 16" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          disabled={isDone}
          onClick={applyMarkdownCodeBlock}
        >
          <path d="m10 9-3 3 3 3" />
          <path d="m14 15 3-3-3-3" />
          <rect x="3" y="3" width="18" height="18" rx="2" />
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
