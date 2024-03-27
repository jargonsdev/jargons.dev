import { useEffect } from "react";
import useDictionaryEditor from "../../hooks/use-dictionary-editor.js";

export default function WordEditor({ title, content }) {
  return (
    <div className="w-full flex border rounded-lg">
      <Editor 
        eTitle={"Hello"} 
        eContent={"# Markdown \n content"} 
        className="w-full h-full flex flex-col p-5 border-r"
      />
      <Preview />
    </div>
  );
}

function Editor({ eTitle, eContent, className, ...props }) {
  const { title, setTitle, content, setContent } = useDictionaryEditor();
  
  useEffect(() => {
    setTitle(eTitle);
    setContent(eContent);
  }, []);

  return (
    <div 
      className={`${className}`}
      {...props}
    >
      <textarea 
        className="w-full grow resize-none appearance-none border-none focus:outline-none scrollbar"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}

function Preview() {
  return (
    <></>
  );
}