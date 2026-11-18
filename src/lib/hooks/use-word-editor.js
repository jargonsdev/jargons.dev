import { useStore } from "@nanostores/react";
import { $wordEditor } from "../stores/dictionary.js";

/**
 * Custom hook serves as wrapper around `wordEditor` map store
 * @returns {{ title: string, content: string, initialContent: string, setTitle: (title: string) => void, setContent: (content: string) => void, setInitialContent: (content: string) => void }}
 */
export default function useWordEditor() {
  const word = useStore($wordEditor);

  function setTitle(title) {
    $wordEditor.setKey("title", title);
  }

  function setContent(content) {
    $wordEditor.setKey("content", content);
  }

  function setInitialContent(content) {
    $wordEditor.setKey("inititalContent", content);
  }

  return {
    title: word.title,
    content: word.content,
    initialContent: word.inititalContent,
    setTitle,
    setContent,
    setInitialContent,
  };
}
