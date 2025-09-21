import { useEffect } from "react";
import Markdown from "react-markdown";
import { useChat } from "@ai-sdk/react"; 

export default function JAIWord({ word }) {  
  /**
   * Initialize useChat hook
   */
  const { messages, status, append } = useChat({
      api: "/api/jai/ask",
      onError: (e) => {
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
  if (status === "submitted" || status === "ready" && messages.length === 0) return (
    <div className="space-y-4">
      <div className="h-6 w-full animate-pulse bg-gray-200 rounded-md" />
      <div className="h-6 w-3/4 animate-pulse bg-gray-200 rounded-md" />
      <div className="h-6 w-4/5 animate-pulse bg-gray-200 rounded-md" />
      <div className="h-6 w-3/5 animate-pulse bg-gray-200 rounded-md" />
    </div>
  );

  return messages.map((msg, index) => (
    <Markdown key={index}>
      { msg.role !== "user" && msg.content }
    </Markdown>
  ))
}