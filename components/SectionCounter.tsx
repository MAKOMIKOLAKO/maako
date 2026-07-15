"use client";

import { useEffect, useState } from "react";
import { sectionIds } from "@/lib/content";

export default function SectionCounter() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(
              entry.target.id as (typeof sectionIds)[number]
            );
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 z-40 hidden sm:block font-mono text-xs text-muted bg-paper/80 backdrop-blur px-2 py-1 rounded"
      aria-hidden="true"
    >
      section {String(active + 1).padStart(2, "0")} / {String(sectionIds.length).padStart(2, "0")}
    </div>
  );
}
