import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useChat } from "@ai-sdk/react";

export default function JAIWordSearch({ word }) {
  const [error, setError] = useState(null);

  /**
   * Initialize useChat hook
   */
  const { messages, status, append } = useChat({
    api: "/api/jai/search",
    onError: (e) => {
      setError(JSON.parse(e.message));
      console.error(e);
    },
  });

  /**
   * Handle Asking jAI for the word definition
   */
  useEffect(() => {
    append({
      role: "user",
      content: `define ${word}`,
    });
  }, [word]);

  /**
   * Loading State
   */
  if (status === "submitted" || (status === "ready" && messages.length === 0))
    return (
      <div className="space-y-4">
        <div className="h-6 w-full animate-pulse bg-gray-200 rounded-md" />
        <div className="h-6 w-3/4 animate-pulse bg-gray-200 rounded-md" />
        <div className="h-6 w-4/5 animate-pulse bg-gray-200 rounded-md" />
        <div className="h-6 w-3/5 animate-pulse bg-gray-200 rounded-md" />
      </div>
    );

  /**
   * Error State
   */
  if (error)
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-red-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <p className="font-medium text-red-800">
            An Error Occured while generating the definition for{" "}
            <span className="font-bold">{word}</span>.
          </p>
        </div>
      </div>
    );

  return messages.map((msg, index) =>
    msg.role !== "user" ? (
      <Markdown key={index}>{msg.content}</Markdown>
    ) : (
      <></>
    ),
  );
}
