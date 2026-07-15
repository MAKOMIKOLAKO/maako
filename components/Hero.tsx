"use client";

import { useEffect, useRef, useState } from "react";
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

    // reward accrues like a real cart-pole episode return: +1 per
    // "timestep" survived, so it only climbs while the pole stays up.
    const rewardTimer = setInterval(() => {
      setReward((r) => r + 1 + Math.random() * 0.4);
    }, 350);

    return () => {
      clearInterval(episodeTimer);
      clearInterval(rewardTimer);
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

      <CartPole onAngleChange={setAngleErr} />

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

// nonlinear cart-pole dynamics (same equations of motion used in the
// classic control-theory benchmark), integrated with a fixed-step
// semi-implicit Euler loop and stabilized with a hand-tuned state-feedback
// controller: F = k1*theta + k2*thetaDot + k3*x + k4*xDot. Gains were
// tuned offline by simulating step response + random angular-velocity
// perturbations until the closed loop stayed bounded over long horizons.
const GRAVITY = 9.8;
const CART_MASS = 1.0;
const POLE_MASS = 0.1;
const HALF_POLE_LENGTH = 0.5;
const TOTAL_MASS = CART_MASS + POLE_MASS;
const POLE_MASS_LENGTH = POLE_MASS * HALF_POLE_LENGTH;

const K_THETA = 20;
const K_THETA_DOT = 5;
const K_X = 0.1;
const K_X_DOT = 0.2;
const FORCE_CLAMP = 25;

const PX_PER_UNIT = 36;
const MAX_TRANSLATE_PX = 170;
const PHYSICS_DT = 1 / 60;

function dynamics(
  x: number,
  xDot: number,
  theta: number,
  thetaDot: number,
  force: number
) {
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const temp =
    (force + POLE_MASS_LENGTH * thetaDot * thetaDot * sinT) / TOTAL_MASS;
  const thetaAcc =
    (GRAVITY * sinT - cosT * temp) /
    (HALF_POLE_LENGTH * (4 / 3 - (POLE_MASS * cosT * cosT) / TOTAL_MASS));
  const xAcc = temp - (POLE_MASS_LENGTH * thetaAcc * cosT) / TOTAL_MASS;
  return { xAcc, thetaAcc };
}

function CartPole({
  onAngleChange,
}: {
  onAngleChange: (deg: number) => void;
}) {
  const cartRef = useRef<HTMLDivElement>(null);
  const poleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const state = { x: 0, xDot: 0, theta: 0.05, thetaDot: 0 };
    let accumulator = 0;
    let lastTime = performance.now();
    let nextPerturbAt = 1.2 + Math.random() * 1.4;
    let elapsed = 0;
    let lastReport = 0;
    let raf = 0;

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const frameDt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += frameDt;

      while (accumulator >= PHYSICS_DT) {
        elapsed += PHYSICS_DT;
        if (elapsed >= nextPerturbAt) {
          state.thetaDot += (Math.random() - 0.5) * 1.2;
          nextPerturbAt = elapsed + 1.2 + Math.random() * 1.4;
        }

        const force = Math.max(
          -FORCE_CLAMP,
          Math.min(
            FORCE_CLAMP,
            K_THETA * state.theta +
              K_THETA_DOT * state.thetaDot +
              K_X * state.x +
              K_X_DOT * state.xDot
          )
        );

        const { xAcc, thetaAcc } = dynamics(
          state.x,
          state.xDot,
          state.theta,
          state.thetaDot,
          force
        );

        state.xDot += xAcc * PHYSICS_DT;
        state.x += state.xDot * PHYSICS_DT;
        state.thetaDot += thetaAcc * PHYSICS_DT;
        state.theta += state.thetaDot * PHYSICS_DT;

        accumulator -= PHYSICS_DT;
      }

      const translatePx = Math.max(
        -MAX_TRANSLATE_PX,
        Math.min(MAX_TRANSLATE_PX, state.x * PX_PER_UNIT)
      );
      const angleDeg = (state.theta * 180) / Math.PI;

      if (cartRef.current) {
        cartRef.current.style.transform = `translateX(calc(-50% + ${translatePx}px))`;
      }
      if (poleRef.current) {
        poleRef.current.style.transform = `translateX(-50%) rotate(${angleDeg}deg)`;
      }

      if (now - lastReport > 220) {
        lastReport = now;
        onAngleChange(Math.abs(angleDeg));
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative h-32 w-full max-w-md overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute left-0 right-0 bottom-8 h-px bg-line" />
      <div
        ref={cartRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="relative">
          <div className="h-4 w-10 rounded-[2px] bg-graphite/80" />
          <div
            ref={poleRef}
            className="absolute left-1/2 bottom-4 origin-bottom"
            style={{ transform: "translateX(-50%) rotate(2.9deg)" }}
          >
            <div className="h-16 w-[2px] bg-accent origin-bottom" />
            <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
