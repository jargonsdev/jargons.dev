import { useState } from "react";

/**
 * Profile Menu Island
 * @param {{ isAuthed: boolean, userData: {}, authUrl: string }} props
 */
export default function Profile({ isAuthed, userData, authUrl }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(
    userData?.avatar_url || "/fallback-avatar.svg"
  );

  // User is not logged in - not connected with GitHub
  if (!isAuthed) {
    return (
      <a
        href={authUrl}
        className="flex items-center justify-center px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base font-medium bg-black text-white border no-underline rounded-lg focus:outline-none hover:shadow-lg"
      >
        <svg
          className="size-4 md:size-5 mr-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
            clipRule="evenodd"
          ></path>
        </svg>{" "}
        Connect
      </a>
    );
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        className={`${
          isDropdownOpen && "ring-4"
        } relative bg-gray-200 flex items-center justify-center size-10 hover:ring-4 ring-gray-200 overflow-hidden bg-transparent rounded-full transition-colors duration-700 cursor-pointer focus-visible:outline-none`}
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        {/* Skeleton Placeholder while image loads */}
        {isImgLoading && (
          <div className="absolute inset-0 animate-pulse bg-gray-300 rounded-full" />
        )}

        {/* User Avatar */}
        <img
          className={`size-10 rounded-full transition-opacity duration-500 ${
            isImgLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
          src={imgSrc}
          alt={userData.login}
          onLoad={() => setIsImgLoading(false)}
          onError={() => {
            if (imgSrc !== "/fallback-avatar.svg")
              setImgSrc("/fallback-avatar.svg");
            setIsImgLoading(false);
          }}
        />

        {/* Spinner Overlay */}
        {isImgLoading && (
          <div className="absolute inset-0 flex items-center justify-center size-full rounded-full bg-black/10">
            <svg
              className="animate-spin w-6 h-6 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        )}

        {/* X Icon when open */}
        {isDropdownOpen && (
          <div className="absolute flex items-center justify-center text-white backdrop-blur-sm size-full rounded-full">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18 17.94 6M18 18 6.06 6"
              />
            </svg>
          </div>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-2 min-w-64 z-50 bg-white border text-sm divide-y divide-gray-100 rounded-lg shadow-lg transform transition-all duration-200 ease-out ${
          isDropdownOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center space-x-2 px-4 py-3 text-sm">
          {/* User Avatar in dropdown */}
          <img
            className="size-10 rounded-full"
            loading="lazy"
            src={imgSrc}
            alt={userData.login}
            onError={() => {
              if (imgSrc !== "/fallback-avatar.svg")
                setImgSrc("/fallback-avatar.svg");
            }}
          />

          <div>
            <div className="line-clamp-1 break-all text-base">
              {userData.name || userData.login}
            </div>
            <div className="text-xs font-medium truncate">
              @{userData.login}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="p-1">
          <li>
            <a
              href="/editor"
              className="no-underline flex items-center space-x-2 px-4 py-2 rounded-sm hover:bg-gray-100"
            >
              <svg
                className="size-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                />
              </svg>
              <span>Editor</span>
            </a>
          </li>
        </ul>

        {/* Logout */}
        <div>
          <a
            href="/logout"
            className="no-underline flex items-center space-x-2 px-5 py-2 hover:bg-red-100 hover:text-red-900"
          >
            <svg
              className="size-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
              />
            </svg>
            <span>Disconnect</span>
          </a>
        </div>
      </div>
    </div>
  );
}
