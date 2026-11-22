import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SETTLE_MS = 1500; // how long the page may still grow while photos and data load
const STEP_MS = 150;

// A new page opens at the top; a link to "/#section" opens that section. Content
// above a section (photos, the announcement bar, data) can still load after the first
// jump and push it down, so the section is scrolled to again for a short while,
// unless the visitor starts scrolling themselves.
export const useScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let stopped = false;
    const stop = () => {
      stopped = true;
    };
    const start = Date.now();
    let timer = 0;
    const go = () => {
      if (stopped) return;
      document.getElementById(id)?.scrollIntoView();
      if (Date.now() - start < SETTLE_MS) timer = window.setTimeout(go, STEP_MS);
    };
    go();
    // The visitor scrolling takes over.
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      stop();
      window.clearTimeout(timer);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [pathname, hash]);
};
