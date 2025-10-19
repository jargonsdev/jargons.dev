/**
 * JAI Word FollowUp Chat Feature Components
 * @exports JAIWordFollowUpChatWidget - Follow-up chat widget for asking jAI context-aware questions
 * @exports JAIWordFollowUpChatWidgetTrigger - Trigger button for opening the jAI follow-up chat widget
 */

import Cookies from "js-cookie";
import JAILogo from "./logo";
import Markdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { $isJAIOpen } from "@/src/lib/stores/jai";
import useRouter from "@/src/lib/hooks/use-router";

// Default question templates
const DEFAULT_QUESTIONS = [
  "Can you give me a real-world example of {word}?",
  "How is {word} used in practice?",
  "How does {word} relate to other concepts?",
  "Are there common misconceptions about {word}?",
];

/**
 * jAI FollowUp Chat Widget Component
 */
export default function JAIFollowUpChatWidget({ word }) {
  const chatContainer = useRef(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(undefined);

  /**
   * Check if user is logged in
   */
  useEffect(() => {
    const token = Cookies.get("jargonsdevToken");
    if (!token) {
      setIsLoggedIn(false);
    } else {
      setIsLoading(true);
      // verify token validity
      fetch("/api/github/oauth/authenticate").then(async (response) => {
        if (response.ok) {
          setIsLoggedIn(true);
          setUser((await response.json()).data);
        } else {
          setIsLoggedIn(false);
        }
      });
    }
    setIsLoading(false);
  }, []);

  /**
   * Initialize useChat hook - handles chat state and interactions
   */
  const { messages, input, status, handleInputChange, handleSubmit, append } =
    useChat({
      api: "/api/jai/follow-up-chat",
      onError: (e) => {
        console.error(e);
      },
    });

  /**
   * Handle clicking on default questions
   * @param {string} questionTemplate - The question template to send
   */
  const handleQuestionClick = (questionTemplate) => {
    const formattedQuestion = formatQuestion(questionTemplate, word);
    // Use append to directly add the message without needing form submission
    append({
      role: "user",
      content: formattedQuestion,
    });
  };

  /**
   * Scroll to the bottom of the chat container when new messages arrive
   */
  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [messages]);

  return (
    <aside className="bg-white relative flex flex-col h-full border border-neutral-200 rounded-e-2xl rounded-s-2xl lg:rounded-e-none ring ring-neutral-100">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        {messages.length > 0 && <JAILogo className="w-20 drop-shadow-md" />}

        {/* Close BTN */}
        <button className="" onClick={() => $isJAIOpen.set(false)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div
        ref={chatContainer}
        className="h-full space-y-5 grow px-5 pt-4 overflow-x-hidden overflow-y-auto scrollbar scroll-smooth"
      >
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => (
              <div key={index} className="flex space-x-3">
                {message.role === "user" ? (
                  <>
                    <div className="flex-none flex items-center justify-center rounded-lg size-10 border bg-neutral-100 border-neutral-200 border-opacity-50 overflow-hidden">
                      <img src={user.avatar_url} alt={user.name} />
                    </div>
                    <div className="w-1flex-1 bg-neutral-50 border border-neutral-200 border-opacity-50 rounded-tl-sm rounded-2xl p-5">
                      <p>{message.content}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-none flex items-center justify-center rounded-lg size-10 border bg-black border-black border-opacity-50">
                      <svg
                        width="19"
                        height="18"
                        viewBox="0 0 19 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.2151 15.4284C12.0677 15.4283 11.9243 15.3828 11.8066 15.2987C11.6889 15.2145 11.6033 15.0964 11.5628 14.962L10.8273 12.5224C10.6689 11.997 10.3718 11.5185 9.96406 11.1322C9.55628 10.7458 9.05129 10.4643 8.49677 10.3142L5.92196 9.61732C5.78029 9.57887 5.65568 9.49776 5.56697 9.38625C5.47826 9.27474 5.43028 9.1389 5.43028 8.99927C5.43028 8.85964 5.47826 8.7238 5.56697 8.61229C5.65568 8.50078 5.78029 8.41967 5.92196 8.38122L8.49677 7.68431C9.05129 7.53425 9.55628 7.25275 9.96406 6.86638C10.3718 6.48001 10.6689 6.00153 10.8273 5.47613L11.5628 3.0365C11.6034 2.90227 11.689 2.7842 11.8067 2.70015C11.9244 2.6161 12.0678 2.57064 12.2151 2.57064C12.3625 2.57064 12.5059 2.6161 12.6236 2.70015C12.7413 2.7842 12.8269 2.90227 12.8674 3.0365L13.603 5.47613C13.7613 6.00153 14.0584 6.48001 14.4662 6.86638C14.874 7.25275 15.379 7.53425 15.9335 7.68431L18.5083 8.38122C18.65 8.41967 18.7746 8.50078 18.8633 8.61229C18.952 8.7238 19 8.85964 19 8.99927C19 9.1389 18.952 9.27474 18.8633 9.38625C18.7746 9.49776 18.65 9.57887 18.5083 9.61732L15.9335 10.3142C15.379 10.4643 14.874 10.7458 14.4662 11.1322C14.0584 11.5185 13.7613 11.997 13.603 12.5224L12.8674 14.962C12.8269 15.0964 12.7414 15.2145 12.6237 15.2987C12.506 15.3828 12.3626 15.4283 12.2151 15.4284ZM4.07273 18C3.92135 18.0001 3.7743 17.9522 3.65495 17.864C3.53561 17.7757 3.45083 17.6522 3.41409 17.5131L3.18068 16.625C2.96717 15.8193 2.30311 15.1901 1.45268 14.9878L0.515396 14.7666C0.368265 14.7321 0.237574 14.6519 0.144163 14.5387C0.0507526 14.4256 0 14.2862 0 14.1425C0 13.9989 0.0507526 13.8594 0.144163 13.7463C0.237574 13.6332 0.368265 13.553 0.515396 13.5185L1.45268 13.2973C2.30311 13.095 2.96717 12.4658 3.18068 11.6601L3.41409 10.772C3.45054 10.6326 3.5352 10.5088 3.65457 10.4202C3.77394 10.3317 3.92115 10.2836 4.07273 10.2836C4.2243 10.2836 4.37151 10.3317 4.49088 10.4202C4.61026 10.5088 4.69491 10.6326 4.73136 10.772L4.96477 11.6601C5.06917 12.0557 5.28509 12.4171 5.58946 12.7054C5.89382 12.9938 6.27519 13.1984 6.69278 13.2973L7.63006 13.5185C7.77719 13.553 7.90788 13.6332 8.00129 13.7463C8.0947 13.8594 8.14545 13.9989 8.14545 14.1425C8.14545 14.2862 8.0947 14.4256 8.00129 14.5387C7.90788 14.6519 7.77719 14.7321 7.63006 14.7666L6.69278 14.9878C6.27519 15.0867 5.89382 15.2913 5.58946 15.5796C5.28509 15.868 5.06917 16.2294 4.96477 16.625L4.73136 17.5131C4.69462 17.6522 4.60984 17.7757 4.4905 17.864C4.37115 17.9522 4.2241 18.0001 4.07273 18ZM5.4298 6.42763C5.28729 6.42771 5.14837 6.38527 5.03275 6.30634C4.91713 6.22741 4.83067 6.11599 4.78564 5.98788L4.42918 4.9738C4.29348 4.59063 3.97683 4.28889 3.57152 4.16116L2.50124 3.82257C2.36647 3.77969 2.24931 3.6978 2.16631 3.58844C2.08331 3.47908 2.03866 3.34778 2.03866 3.21309C2.03866 3.07839 2.08331 2.94709 2.16631 2.83773C2.24931 2.72837 2.36647 2.64648 2.50124 2.60361L3.57152 2.26501C3.97592 2.13643 4.29438 1.8364 4.42918 1.45237L4.78654 0.438292C4.83179 0.310596 4.91822 0.199593 5.03364 0.120951C5.14906 0.0423088 5.28763 0 5.4298 0C5.57196 0 5.71053 0.0423088 5.82595 0.120951C5.94137 0.199593 6.0278 0.310596 6.07305 0.438292L6.43041 1.45237C6.49705 1.64157 6.60923 1.81349 6.75809 1.95453C6.90695 2.09557 7.08839 2.20187 7.28808 2.26501L8.35835 2.60361C8.49312 2.64648 8.61028 2.72837 8.69328 2.83773C8.77628 2.94709 8.82093 3.07839 8.82093 3.21309C8.82093 3.34778 8.77628 3.47908 8.69328 3.58844C8.61028 3.6978 8.49312 3.77969 8.35835 3.82257L7.28808 4.16116C6.88367 4.28975 6.56521 4.58977 6.43041 4.9738L6.07305 5.98788C6.02806 6.11585 5.94174 6.22717 5.8263 6.30609C5.71086 6.38501 5.57215 6.42753 5.4298 6.42763Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div className="w-1 flex-1 bg-neutral-50 border border-neutral-200 border-opacity-50 rounded-tl-sm rounded-2xl p-5">
                      <Markdown className="prose max-w-max">
                        {message.content}
                      </Markdown>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* jAI Loading */}
            {status === "submitted" && (
              <div className="flex space-x-3">
                <div className="flex-none flex items-center justify-center rounded-lg size-10 border bg-black border-black border-opacity-50">
                  <svg
                    width="19"
                    height="18"
                    viewBox="0 0 19 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.2151 15.4284C12.0677 15.4283 11.9243 15.3828 11.8066 15.2987C11.6889 15.2145 11.6033 15.0964 11.5628 14.962L10.8273 12.5224C10.6689 11.997 10.3718 11.5185 9.96406 11.1322C9.55628 10.7458 9.05129 10.4643 8.49677 10.3142L5.92196 9.61732C5.78029 9.57887 5.65568 9.49776 5.56697 9.38625C5.47826 9.27474 5.43028 9.1389 5.43028 8.99927C5.43028 8.85964 5.47826 8.7238 5.56697 8.61229C5.65568 8.50078 5.78029 8.41967 5.92196 8.38122L8.49677 7.68431C9.05129 7.53425 9.55628 7.25275 9.96406 6.86638C10.3718 6.48001 10.6689 6.00153 10.8273 5.47613L11.5628 3.0365C11.6034 2.90227 11.689 2.7842 11.8067 2.70015C11.9244 2.6161 12.0678 2.57064 12.2151 2.57064C12.3625 2.57064 12.5059 2.6161 12.6236 2.70015C12.7413 2.7842 12.8269 2.90227 12.8674 3.0365L13.603 5.47613C13.7613 6.00153 14.0584 6.48001 14.4662 6.86638C14.874 7.25275 15.379 7.53425 15.9335 7.68431L18.5083 8.38122C18.65 8.41967 18.7746 8.50078 18.8633 8.61229C18.952 8.7238 19 8.85964 19 8.99927C19 9.1389 18.952 9.27474 18.8633 9.38625C18.7746 9.49776 18.65 9.57887 18.5083 9.61732L15.9335 10.3142C15.379 10.4643 14.874 10.7458 14.4662 11.1322C14.0584 11.5185 13.7613 11.997 13.603 12.5224L12.8674 14.962C12.8269 15.0964 12.7414 15.2145 12.6237 15.2987C12.506 15.3828 12.3626 15.4283 12.2151 15.4284ZM4.07273 18C3.92135 18.0001 3.7743 17.9522 3.65495 17.864C3.53561 17.7757 3.45083 17.6522 3.41409 17.5131L3.18068 16.625C2.96717 15.8193 2.30311 15.1901 1.45268 14.9878L0.515396 14.7666C0.368265 14.7321 0.237574 14.6519 0.144163 14.5387C0.0507526 14.4256 0 14.2862 0 14.1425C0 13.9989 0.0507526 13.8594 0.144163 13.7463C0.237574 13.6332 0.368265 13.553 0.515396 13.5185L1.45268 13.2973C2.30311 13.095 2.96717 12.4658 3.18068 11.6601L3.41409 10.772C3.45054 10.6326 3.5352 10.5088 3.65457 10.4202C3.77394 10.3317 3.92115 10.2836 4.07273 10.2836C4.2243 10.2836 4.37151 10.3317 4.49088 10.4202C4.61026 10.5088 4.69491 10.6326 4.73136 10.772L4.96477 11.6601C5.06917 12.0557 5.28509 12.4171 5.58946 12.7054C5.89382 12.9938 6.27519 13.1984 6.69278 13.2973L7.63006 13.5185C7.77719 13.553 7.90788 13.6332 8.00129 13.7463C8.0947 13.8594 8.14545 13.9989 8.14545 14.1425C8.14545 14.2862 8.0947 14.4256 8.00129 14.5387C7.90788 14.6519 7.77719 14.7321 7.63006 14.7666L6.69278 14.9878C6.27519 15.0867 5.89382 15.2913 5.58946 15.5796C5.28509 15.868 5.06917 16.2294 4.96477 16.625L4.73136 17.5131C4.69462 17.6522 4.60984 17.7757 4.4905 17.864C4.37115 17.9522 4.2241 18.0001 4.07273 18ZM5.4298 6.42763C5.28729 6.42771 5.14837 6.38527 5.03275 6.30634C4.91713 6.22741 4.83067 6.11599 4.78564 5.98788L4.42918 4.9738C4.29348 4.59063 3.97683 4.28889 3.57152 4.16116L2.50124 3.82257C2.36647 3.77969 2.24931 3.6978 2.16631 3.58844C2.08331 3.47908 2.03866 3.34778 2.03866 3.21309C2.03866 3.07839 2.08331 2.94709 2.16631 2.83773C2.24931 2.72837 2.36647 2.64648 2.50124 2.60361L3.57152 2.26501C3.97592 2.13643 4.29438 1.8364 4.42918 1.45237L4.78654 0.438292C4.83179 0.310596 4.91822 0.199593 5.03364 0.120951C5.14906 0.0423088 5.28763 0 5.4298 0C5.57196 0 5.71053 0.0423088 5.82595 0.120951C5.94137 0.199593 6.0278 0.310596 6.07305 0.438292L6.43041 1.45237C6.49705 1.64157 6.60923 1.81349 6.75809 1.95453C6.90695 2.09557 7.08839 2.20187 7.28808 2.26501L8.35835 2.60361C8.49312 2.64648 8.61028 2.72837 8.69328 2.83773C8.77628 2.94709 8.82093 3.07839 8.82093 3.21309C8.82093 3.34778 8.77628 3.47908 8.69328 3.58844C8.61028 3.6978 8.49312 3.77969 8.35835 3.82257L7.28808 4.16116C6.88367 4.28975 6.56521 4.58977 6.43041 4.9738L6.07305 5.98788C6.02806 6.11585 5.94174 6.22717 5.8263 6.30609C5.71086 6.38501 5.57215 6.42753 5.4298 6.42763Z"
                      fill="white"
                    />
                  </svg>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 border-opacity-50 rounded-tl-sm rounded-2xl p-5">
                  <p className="text-sm animate-pulse">•••</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <JAIIntro
            status={{ isLoggedIn, isLoading }}
            word={word}
            onQuestionClick={handleQuestionClick}
          />
        )}
      </div>

      {
        /* Chat Input Box */
        isLoggedIn && !isLoading && (
          <form
            onSubmit={handleSubmit}
            className="m-4 pt-3 pb-1.5 pe-1.5 ps-3 border border-neutral-200 border-opacity-70 rounded-2xl"
          >
            <textarea
              id="message"
              rows="1"
              className="scrollbar block w-full h-auto resize-none text-gray-900 focus:ring-0 focus:border-none outline-none overflow-hidden"
              placeholder="Ask anything"
              value={input}
              onChange={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                handleInputChange(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="size-9 bg-black text-white flex items-center justify-center rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                  />
                </svg>
              </button>
            </div>
          </form>
        )
      }
    </aside>
  );
}

/**
 * jAI FollowUp Chat Widget Trigger Button
 */
export function JAIFollowUpChatWidgetTrigger() {
  return (
    <button
      className="rounded-full flex items-center space-x-1.5 bg-black text-neutral-800 px-3 py-1 border border-neutral-300 ring ring-neutral-100 hover:ring-neutral-200 transition-color ease-in-out duration-300"
      onClick={() => $isJAIOpen.set(!$isJAIOpen.value)}
    >
      <span className="text-sm text-white">Ask</span>
      <JAILogo className="w-10 drop-shadow-md" />
    </button>
  );
}

/**
 * jAI Intro Screen
 */
function JAIIntro({ status, word, onQuestionClick }) {
  const { pathname } = useRouter();
  const { isLoggedIn, isLoading } = status;

  if (isLoading || isLoggedIn === undefined) {
    return (
      <div className="h-full space-y-8 flex flex-col items-center justify-center -mt-20">
        <JAILogo className="w-52 drop-shadow-md mx-auto" />
        <div className="size-8 border-4 border-t-black border-l-black border-r-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full space-y-4 flex flex-col items-center justify-center -mt-20">
      <JAILogo className="w-52 drop-shadow-md mx-auto" />

      {isLoggedIn ? (
        <p className="text-lg w-10/12 mx-auto text-center">
          Ask me anything about <span className="underline">{word}</span> or
          other technical jargon
        </p>
      ) : (
        <p className="text-lg w-10/12 mx-auto text-center">
          Want to dig deeper into <span className="underline">{word}</span>? Log
          in to ask <strong>jAI</strong> your own follow-up questions and get
          helpful, context-aware answers—all without leaving the page.
          <br />
          <br />
          We’ll take you to the login screen real quick.
        </p>
      )}

      <div className="mx-auto text-center space-y-4 space-x-4">
        {isLoggedIn ? (
          <>
            {DEFAULT_QUESTIONS.map((questionTemplate, index) => (
              <button
                key={index}
                onClick={() => onQuestionClick(questionTemplate)}
                className="bg-neutral-100 border border-neutral-200 rounded-lg px-5 py-2.5 hover:bg-neutral-200 transition-colors duration-200 cursor-pointer"
              >
                {formatQuestion(questionTemplate, word)}
              </button>
            ))}
          </>
        ) : (
          <a
            href={`/login?return_to=${encodeURIComponent(pathname)}?jai=1`}
            className="flex items-center justify-center h-12 mr-3 px-3 text-lg font-medium bg-black text-white border no-underline rounded-lg focus:outline-none hover:shadow-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>{" "}
            Login
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Format question template with the current word
 * @param {string} questionTemplate - Template with {word} placeholder
 * @param {string} word - The word to replace the placeholder with
 * @returns {string} Formatted question
 */
function formatQuestion(questionTemplate, word) {
  return questionTemplate.replace("{word}", word);
}
