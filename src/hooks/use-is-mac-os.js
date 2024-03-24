import { useEffect, useState } from "react";

const MAC_OS_USER_AGENT_PART = /Mac|Macintosh|MacIntel|Mac OS X/;

export default function useIsMacOS() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const userAgentCheck = MAC_OS_USER_AGENT_PART.test(window.navigator.userAgent);
    setIsMac(userAgentCheck);
  }, []);

  return isMac;
}