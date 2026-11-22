import { useEffect, useState } from "react";

// Returns the id of the landing section currently under the navbar, or null near the
// top of the page (the hero) and on pages without these sections.
export const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    const update = () => {
      // A line a third of the way down the screen: the section crossing it is "current".
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const id of key.split(",")) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }
      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [key]);

  return active;
};
