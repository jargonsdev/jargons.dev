/**
 * Profile Menu Island
 * @param {{ isAuthed: boolean, userData: {}, authUrl: string }} props 
 */
export default function Profile({ isAuthed, userData, authUrl }) {
    console.log({ isAuthed, userData, authUrl });

    if (!isAuthed) {
        return (
            <a href={authUrl} class="flex items-center justify-center px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base font-medium bg-black text-white border no-underline rounded-lg focus:outline-none hover:shadow-lg">
                <svg className="size-4 md:size-5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clipRule="evenodd"></path>
                </svg> Connect
            </a>
        )
    }

    return (
        <div className="relative">
            <button className="flex items-center justify-center size-10 bg-transparent rounded-full hover:bg-gray-200 hover:border transition-colors duration-700 cursor-pointer">
                <img class="size-8 rounded-full" loading="lazy" src={userData.avatar_url} alt={userData.login} />
            </button>
        </div>
    );
}