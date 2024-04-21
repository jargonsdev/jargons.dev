import { useEffect } from "react";
import Markdown from "react-markdown";
import { useStore } from "@nanostores/react";
import useRouter from "../../lib/hooks/use-router.js";
import useWordEditor from "../../lib/hooks/use-word-editor.js";
import { $isWordSubmitLoading } from "../../lib/stores/dictionary.js";
import handleSubmitWord from "../../lib/handlers/handle-submit-word.js";
import { capitalizeText } from "../../lib/utils/index.js";

export default function WordEditor({ title = "", content = "", metadata = {}, action, octokitAuths }) {
  return (
    <div className="w-full flex border rounded-lg">
      <Editor
        action={action}
        eTitle={title} 
        eContent={content} 
        eMetadata={metadata}
        octokitAuths={octokitAuths}
        submitHandler={handleSubmitWord}
        className="w-full h-full flex flex-col p-5 border-r"
      />
      <Preview className="w-full h-full flex flex-col p-5" />
    </div>
  );
}

export function SubmitButton({ children = "Submit" }) {
  const isSubmitLoading = useStore($isWordSubmitLoading);
  
  return (
    <button className="flex items-center justify-center no-underline text-white bg-gray-900 hover:bg-gray-700 focus:ring-0 font-medium rounded-lg text-base px-5 py-2.5 text-center ml-1 sm:ml-3"
      type="submit"
      form="jargons.dev:word_editor"
      disabled={isSubmitLoading}
    >
      { isSubmitLoading ? (
        <div className="flex-none h-4 w-4 md:w-6 md:h-6 rounded-full border-2 border-gray-400 border-b-gray-200 border-r-gray-200 animate-spin" />
      ) : (
        children
      ) }
    </button>
  );
}

function Editor({ eTitle, eContent, eMetadata, className, submitHandler, action, octokitAuths, ...props }) {
  const router = useRouter();
  const { title, setTitle, content, setContent } = useWordEditor();
  
  useEffect(() => {
    setTitle(eTitle);
    setContent(eContent);
  }, []);

  async function handleOnSubmit(e) {
    $isWordSubmitLoading.set(true);
    const formData = new FormData(e.target);
    const response = await fetch("/api/dictionary", {
      method: "POST",
      body: formData,
    });
    response.status === 200 && router.push("/editor");
  }

  return (
    <form 
      className={`${className} relative`}
      onSubmit={(e) => {
        e.preventDefault();
        handleOnSubmit(e);
      }}
      id="jargons.dev:word_editor"
      {...props}
    >
      <input 
        className={`${action === "edit" && "cursor-not-allowed"} block w-full pb-2 mb-3 text-gray-900 border-b text-lg font-bold focus:outline-none`}
        type="text"
        id="title"
        name="title"
        placeholder="New Word"
        value={title}
        required
        readOnly={action === "edit"}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea 
        className="w-full h-1 grow resize-none appearance-none border-none focus:outline-none scrollbar"
        id="content"
        name="content"
        value={content}
        required
        onChange={(e) => setContent(e.target.value)}
      />
      <input 
        type="hidden" 
        id="action" 
        name="action"
        value={action}
      />
      {action === "edit" && (
        <input 
          type="hidden" 
          id="metadata"
          name="metadata"
          value={JSON.stringify(eMetadata)}
        />
      )}
    </form>
  );
}

function Preview({ className, ...props }) {
  const { title, content } = useWordEditor();

  return (
    <div 
      className={`${className} select-none`}
      {...props}  
    >
      <div className="h-1 grow overflow-auto space-y-6 rounded-lg border p-5 shadow-lg scrollbar">
        <DummyPreviewNavbar />

        <div className="max-w-4xl space-y-8 mx-auto">
          <div className="w-full">
            {title && (
              <h1 className="text-4xl font-black">
                { capitalizeText(title.trim()) }
              </h1>
            )}
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
        <div className="relative w-56 text-sm hidden @md:flex items-center justify-between border pl-2.5 p-1 space-x-2 border-gray-400 rounded-lg">
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