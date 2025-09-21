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

  return messages.map((msg, index) => (
    <Markdown key={index}>
      { msg.role !== "user" && msg.content }
    </Markdown>
  ))
}