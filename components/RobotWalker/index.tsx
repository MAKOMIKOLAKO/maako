"use client";

import { useEffect, useState } from "react";
import Scene from "./Scene";

const MIN_VIEWPORT_WIDTH = 768;

export default function RobotWalker() {
  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function evaluate() {
      const tooSmall = window.innerWidth < MIN_VIEWPORT_WIDTH;
      setEnabled(!tooSmall && !coarsePointer.matches);
      setReducedMotion(reduceMotion.matches);
    }

    evaluate();
    window.addEventListener("resize", evaluate);
    coarsePointer.addEventListener("change", evaluate);
    reduceMotion.addEventListener("change", evaluate);
    return () => {
      window.removeEventListener("resize", evaluate);
      coarsePointer.removeEventListener("change", evaluate);
      reduceMotion.removeEventListener("change", evaluate);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Scene reducedMotion={reducedMotion} />
    </div>
  );
}
