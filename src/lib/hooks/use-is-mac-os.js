import { useEffect, useState } from "react";

const MAC_OS_USER_AGENT_PART = /Mac|Macintosh|MacIntel|Mac OS X/;

/**
 * Custom hook used to check if current user's machine is macOS
 * @returns {boolean}
 */
export default function useIsMacOS() {
  const [isMacOS, setIsMacOS] = useState(false);

  useEffect(() => {
    const userAgentCheck = MAC_OS_USER_AGENT_PART.test(
      window.navigator.userAgent,
    );
    setIsMacOS(userAgentCheck);
  }, []);

  return isMacOS;
}
