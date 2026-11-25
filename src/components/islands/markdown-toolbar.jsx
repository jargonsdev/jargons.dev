const DICTIONARY_ACTIONS = [
  {
    id: "bold",
    label: "Bold (Ctrl+B)",
    icon: (
      <path d="M6 12h9a4 4 0 010 8H7a1 1 0 01-1-1V5a1 1 0 011-1h7a4 4 0 010 8" />
    ),
  },
  {
    id: "italic",
    label: "Italic (Ctrl+I)",
    icon: (
      <>
        <line x1="19" x2="10" y1="4" y2="4" />
        <line x1="14" x2="5" y1="20" y2="20" />
        <line x1="15" x2="9" y1="4" y2="20" />
      </>
    ),
  },
  {
    id: "unordered-list",
    label: "Bulleted list",
    icon: (
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M3 5h.01" />
        <path d="M3 12h.01" />
        <path d="M3 19h.01" />
        <path d="M8 5h13" />
        <path d="M8 12h13" />
        <path d="M8 19h13" />
      </g>
    ),
  },
  {
    id: "ordered-list",
    label: "Numbered list",
    icon: (
      <>
        <path d="M11 5h10" />
        <path d="M11 12h10" />
        <path d="M11 19h10" />
        <path d="M4 4h1v5" />
        <path d="M4 9h2" />
        <path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02" />
      </>
    ),
  },
  {
    id: "inline-code",
    label: "Inline code",
    icon: (
      <>
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </>
    ),
  },
  {
    id: "code-block",
    label: "Code block",
    icon: (
      <>
        <path d="m10 9-3 3 3 3" />
        <path d="m14 15 3-3-3-3" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </>
    ),
  },
];

const ARTICLE_ACTIONS = [
  ...DICTIONARY_ACTIONS,
  {
    id: "heading",
    label: "Heading 2",
    icon: (
      <>
        <path d="M4 5v14" />
        <path d="M12 5v14" />
        <path d="M4 12h8" />
        <path d="M20 8h-4v4h4v4h-4" />
      </>
    ),
  },
  {
    id: "link",
    label: "Insert link",
    icon: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71" />
      </>
    ),
  },
  {
    id: "blockquote",
    label: "Blockquote",
    icon: (
      <>
        <path d="M3 21c3 0 5-2 5-5V8H3v8h5" />
        <path d="M14 21c3 0 5-2 5-5V8h-5v8h5" />
      </>
    ),
  },
];

const ACTIONS_BY_VARIANT = {
  dictionary: DICTIONARY_ACTIONS,
  article: ARTICLE_ACTIONS,
};

export default function MarkdownToolbar({
  variant = "dictionary",
  disabled = false,
  onAction,
}) {
  const actions = ACTIONS_BY_VARIANT[variant] ?? DICTIONARY_ACTIONS;

  return (
    <div
      className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-1 border-b bg-white px-3 py-2"
      role="toolbar"
      aria-label={
        variant === "article" ? "Article formatting" : "Markdown formatting"
      }
    >
      {actions.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          title={label}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onAction?.(id)}
          className="inline-flex size-8 items-center justify-center rounded text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            {icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
