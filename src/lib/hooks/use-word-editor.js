import { useStore } from "@nanostores/react";
import { $wordEditor } from "../stores/dictionary.js";

/**
 * Custom hook serves as wrapper around `wordEditor` map store
 * @returns {{ title: string, content: string, setTitle: (title: string) => void, setContent: (content: string) => void }}
 */
export default function useWordEditor() {
  const word = useStore($wordEditor);

  function setTitle(title) {
    $wordEditor.setKey("title", title);
  }

  function setContent(content) {
    $wordEditor.setKey("content", content);
  }

  function setInitialTitle(title) {
    $wordEditor.setKey("initialTitle", title);
  }

  function setInitialContent(content) {
    $wordEditor.setKey("initialContent", content);
  }

  return {
    title: word.title,
    content: word.content,
    initialTitle: word.initialTitle,
    initialContent: word.initialContent,
    setTitle,
    setContent,
    setInitialTitle,
    setInitialContent,
  };
}
