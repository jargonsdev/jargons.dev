import { useEffect } from "react";
import Markdown from "react-markdown";
import useDictionaryEditor from "../../hooks/use-dictionary-editor.js";

export default function WordEditor({ title = "", content = "" }) {
  return (
    <div className="w-full flex border rounded-lg">
      <Editor 
        eTitle={title} 
        eContent={content} 
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
      className={`${className} relative`}
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
      className={`${className} select-none`}
      {...props}  
    >
      <div className="grow overflow-auto space-y-6 rounded-lg border p-5 shadow-lg">
        <DummyPreviewNavbar />

        <div className="max-w-4xl space-y-8 mx-auto">
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

const DummyPreviewNavbar = () => (
  <div className="@container">
    <nav className="flex items-center justify-between pb-4">
      <span className="flex items-center underline">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg> 
        <span>
          Back
        </span>       
      </span>

      <div>
        <div className="relative w-56 text-sm hidden @md:flex items-center justify-between border pl-2.5 p-1 space-x-2 border-gray-400 rounded-lg cursor-text">
          <div className="flex items-center text-gray-400 space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="focus:outline-none truncate">Search word</span>			
          </div>	
          <kbd className="text-gray-600 py-1 px-2 rounded-md border border-gray-400 ml-auto bg-gray-100">
            <><span className="text-sm mr-0.5">⌘</span>K</>
          </kbd>
        </div>
        <button className="flex @md:hidden font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      </div>
    </nav>
  </div>
);