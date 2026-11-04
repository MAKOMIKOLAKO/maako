"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Telemetry } from "./controller";

export type { Telemetry } from "./controller";

// three.js + the scene load only when the arm is actually shown
const ArmScene = dynamic(() => import("./ArmScene"), { ssr: false });

export default function ArmSim({
  onTelemetry,
  onError,
}: {
  onTelemetry: (t: Telemetry) => void;
  onError: () => void;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      className="relative h-60 w-full sm:h-72 touch-pan-y"
      role="img"
      aria-label="Simulated SO-101 robot arm picking up and placing a cube"
    >
      <ArmScene reducedMotion={reducedMotion} onTelemetry={onTelemetry} onError={onError} />
    </div>
  );
}
