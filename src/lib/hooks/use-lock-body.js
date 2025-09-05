import { useLayoutEffect } from "react";

/**
 * Cutom hook to help remove navigation-ability from web page
 */
export default function useLockBody() {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = originalStyle);
  }, []);
}
