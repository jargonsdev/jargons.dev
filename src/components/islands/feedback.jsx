import { useState } from "react";
import { useStore } from "@nanostores/react";
import { PROJECT_REPO_DETAILS } from "../../../constants.js";
import { $isFeedbackOpen, $isSendingFeedback } from "../../lib/stores/feedback.js";

export default function Feedback({ pathname }) {
  const isFeedbackOpen = useStore($isFeedbackOpen);
  const isSendingFeedback = useStore($isSendingFeedback);
  const [feedbackSent, setFeedbackSent] = useState({ stat: false, response: {} });

  /**
   * Word Submit Handler
   * @param {import("react").FormEvent} e 
   */
  async function handleSubmit(e) {
    e.preventDefault();
    $isSendingFeedback.set(true);
    const formData = new FormData(e.target);
    const response = await fetch("/api/feedback", {
      method: "POST",
      body: formData,
    });
    if (response.status === 200) {
      const data = await response.json();
      console.log(data);
      e.target.reset();
      setFeedbackSent({stat: true, response: data});
      $isSendingFeedback.set(false);
      setTimeout(() => {
        $isFeedbackOpen.set(!isFeedbackOpen);
      }, 5000);
    }
  }

  if (isFeedbackOpen) return (
    <div className="fixed left-0 top-0 z-auto p-5 w-full h-full flex flex-col items-center justify-center bg-gray-100/30">
      {/* Blur */}
      <div onClick={() => $isFeedbackOpen.set(!isFeedbackOpen)}
        className="absolute w-full h-full left-0 top-0 z-50 backdrop-blur-lg"
      />
      <form className="m-auto z-50 w-full max-w-5xl" 
        onSubmit={handleSubmit} 
        onChange={(e) => {
          if (feedbackSent.stat === true) setFeedbackSent({ stat: false, response: {} })
        }}
      >
        <div className="bg-white text-center w-fit mx-auto mb-4 p-4 rounded shadow-lg text-lg font-bold">
          <h1>You are currently submitting feedback for <tt class="bg-gray-700 rounded text-white px-2">{ pathname }</tt></h1>
        </div>
        <div className="flex flex-col bg-white h-fit w-full shadow-xl z-50 border rounded-lg overflow-hidden">
          <div className="relative z-50 flex items-center space-x-3 pl-2 p-2 md:pl-4 md:pr-2 md:py-2 ">	
            <textarea
              autoFocus
              type="text"
              id="feedback"
              name="feedback"
              className="block w-full bg-transparent text-gray-600 focus:outline-none text-base md:text-lg"
            />
            <input type="hidden" id="title" name="title" value={`Feedback Submission: ${pathname}`} />
            <input type="hidden" id="pathname" name="pathname" value={pathname} />
          </div>
        </div>
        <button disabled={isSendingFeedback} className="mt-4 uppercase relative mx-auto flex cursor-pointer items-center space-x-1 h-fit w-fit justify-center no-underline px-4 py-2 rounded-md border border-gray-200 bg-black text-white text-xs md:text-sm shadow-sm hover:shadow transition-colors">
          { isSendingFeedback ? (
            <div className="flex-none h-4 w-4 md:w-6 md:h-6 rounded-full border-2 border-gray-400 border-b-gray-200 border-r-gray-200 animate-spin" />
          ) : (
            <>
              <span>Submit Feedback</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" class="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </> 
          ) }
        </button>
        {feedbackSent.stat ? (
          <p className="flex space-x-1 items-center mx-auto w-fit bg-white p-2 rounded shadow mt-3">
            <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clip-rule="evenodd"/>
            </svg>
            <span>
              Your feedback has been submitted successfully <a target="_blank" href={feedbackSent.response.html_url}>{feedbackSent.response.html_url}</a>
            </span>
          </p>
        ) : (
          <p className="mx-auto w-fit bg-white p-2 rounded shadow mt-3">Your feedback will be submitted as an issue to our repo at <a target="_blank" href={`https://github.com/${PROJECT_REPO_DETAILS.repoFullname}`}>{PROJECT_REPO_DETAILS.repoFullname}</a></p>
        )}
      </form>
    </div>
  );
}

export function FeedbackTrigger() {
  return (
    <a 
      className="cursor-pointer" 
      onClick={() => $isFeedbackOpen.set(!$isFeedbackOpen.value)}
    >
      Send Feedback
    </a>
  )
}