"use client";

import { useEffect, useState } from "react";
import { heroLinks } from "@/lib/content";

export default function Hero() {
  const [episode, setEpisode] = useState(412);
  const [reward, setReward] = useState(104);
  const [angleErr, setAngleErr] = useState(0.6);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const episodeTimer = setInterval(() => {
      setEpisode((e) => e + 1);
    }, 4000);

    const telemetryTimer = setInterval(() => {
      setReward((r) => Math.max(100, r + (Math.random() * 3 - 0.6)));
      setAngleErr(() => Math.abs(Math.random() * 1.1 + 0.1));
    }, 1000);

    return () => {
      clearInterval(episodeTimer);
      clearInterval(telemetryTimer);
    };
  }, []);

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
        <span>episode {String(episode).padStart(4, "0")}</span>
      </div>

      <div>
        <h1 className="text-[26px] sm:text-[32px] font-medium tracking-tight text-graphite">
          maako fangajei
        </h1>
        <p className="mt-2 text-secondary text-base sm:text-lg">
          robotics · reinforcement learning · embedded ml
        </p>
      </div>

      <CartPole />

      <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-secondary">
        <span>policy: ppo</span>
        <span>reward: {reward.toFixed(1)}</span>
        <span>angle err: {angleErr.toFixed(2)} deg</span>
      </div>

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

function CartPole() {
  return (
    <div
      className="relative h-32 w-full max-w-md overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute left-0 right-0 bottom-8 h-px bg-line" />
      <div className="cart-anim absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="relative">
          <div className="h-4 w-10 rounded-[2px] bg-graphite/80" />
          <div className="pole-anim absolute left-1/2 bottom-4 -translate-x-1/2">
            <div className="h-16 w-[2px] bg-accent origin-bottom" />
            <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
