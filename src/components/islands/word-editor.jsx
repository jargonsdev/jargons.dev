import { useEffect } from "react";
import Markdown from "react-markdown";
import useDictionaryEditor from "../../hooks/use-dictionary-editor.js";

export default function WordEditor({ title, content }) {
  return (
    <div className="w-full flex border rounded-lg">
      <Editor 
        eTitle={"Hello"} 
        eContent={"# Markdown \n content"} 
        className="w-full h-full flex flex-col p-5 border-r"
      />
      <Preview className="w-full h-full flex flex-col p-5" />
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

function Preview({ className, ...props }) {
  const { title, content } = useDictionaryEditor();

  return (
    <div 
      className={`${className}`}
      {...props}  
    >
      <div className="grow overflow-auto space-y-6 rounded-lg border p-5 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="w-full">
            <h1 className="text-4xl font-black">
              { title }
            </h1>
          </div>

          <article className="w-full max-w-screen-lg prose">
            <Markdown>
              { content }
            </Markdown>
          </article>
        </div>
      </div>
    </div>
  );
}