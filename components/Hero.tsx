"use client";

import { useState } from "react";
import { heroLinks } from "@/lib/content";
import ArmSim, { type Telemetry } from "@/components/ArmSim";

export default function Hero() {
  // false when WebGL2 is missing or the model fails to load; the sim and
  // its telemetry are then left out rather than showing a broken canvas
  const [armAvailable, setArmAvailable] = useState(true);
  const [arm, setArm] = useState<Telemetry | null>(null);

  return (
    <section
      id="hero"
      className="min-h-[92vh] flex flex-col justify-center gap-10 py-24"
    >
      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-live" />
          system: online
        </span>
        {armAvailable && <span>cycle {String(arm?.cycles ?? 0).padStart(4, "0")}</span>}
      </div>

      <div>
        <h1 className="text-[26px] sm:text-[32px] font-medium tracking-tight text-graphite">
          maako fangajei
        </h1>
        <p className="mt-2 text-secondary text-base sm:text-lg">
          machine learning · robot learning  · embedded systems
        </p>
      </div>

      {armAvailable && (
        <>
          <ArmSim onTelemetry={setArm} onError={() => setArmAvailable(false)} />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-secondary">
            <span>system: so-101 · 5-dof</span>
            <span className="min-w-[9.5rem]">task: {arm ? phaseLabel(arm.phase) : "loading"}</span>
            <span className="min-w-[8.5rem] tabular-nums">
              track err: {(arm?.trackingErrorMm ?? 0).toFixed(1)} mm
            </span>
          </div>
        </>
      )}

      <div className="flex gap-5 font-mono text-xs">
        {heroLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent focus-visible:decoration-accent outline-none"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function phaseLabel(phase: Telemetry["phase"]): string {
  return phase === "teleop" ? "teleop (cursor)" : phase;
}
