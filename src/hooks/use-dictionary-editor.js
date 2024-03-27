import { useStore } from "@nanostores/react";
import { $dictionaryEditor } from "../stores/dictionary.js";

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