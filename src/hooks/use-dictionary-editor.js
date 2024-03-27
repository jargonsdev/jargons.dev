import { useStore } from "@nanostores/react";
import { $dictionaryEditor } from "../stores/dictionary.js";

/**
 * Custom hook serves as wrapper around `dictionary` store
 * @returns {{ title: string, content: string, setTitle: (title: string) => void, setContent: (content: string) => void }}
 */
export default function useDictionaryEditor() {
  const dictionaryItem = useStore($dictionaryEditor);

  function setTitle(title) {
    $dictionaryEditor.setKey("title", title);
  };

  function setContent(content) {
    $dictionaryEditor.setKey("content", content);
  };

  return {
    title: dictionaryItem.title,
    content: dictionaryItem.content,
    setTitle,
    setContent
  }
}