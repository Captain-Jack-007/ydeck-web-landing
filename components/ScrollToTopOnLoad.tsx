"use client";

import { useEffect } from "react";

export function ScrollToTopOnLoad() {
  useEffect(() => {
    const previousMode = window.history.scrollRestoration;
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.history.scrollRestoration = "manual";
    scrollToTop();

    const frameId = window.requestAnimationFrame(scrollToTop);
    window.addEventListener("pageshow", scrollToTop);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pageshow", scrollToTop);
      window.history.scrollRestoration = previousMode;
    };
  }, []);

  return null;
}
