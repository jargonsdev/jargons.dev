import { useEffect, useState } from "react";

/**
 * Custom router Hook (just a wrapper for Window.location)
 * @returns { Omit<Location, "assign"> &  { push: (pathname: string, origin?: string) => void } }
 */
export default function useRouter() {
  const [windowLocationObj, setWindowLocationObj] = useState(null);
  const [windowLocationObjProps, setWindowLocationObjProps] = useState(null);

  useEffect(() => {
    setWindowLocationObj(window.location);
    const { assign, ...otherWindowLocationObjProps } = window.location;
    setWindowLocationObjProps(otherWindowLocationObjProps);
  }, []);


  return {
    push: (url) => {
      const location = isAbsoluteUrl(url) ? url : windowLocationObj.origin + url;
      return windowLocationObj.assign(location);
    },
    ...windowLocationObjProps
  };
}

/**
 * Test if url is absolute
 * @param {string} url 
 * @returns {boolean}
 */
function isAbsoluteUrl(url) {
  return /^(?:\w+:)?\/\/([^\/?#]+)(?:[\/?#]|$)/.test(url);
}