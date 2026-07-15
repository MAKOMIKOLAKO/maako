"use client";

import { useEffect, useRef, useState } from "react";
import { heroLinks } from "@/lib/content";

type Mode = "double" | "cart";

export default function Hero() {
  const [mode, setMode] = useState<Mode>("double");
  const [episode, setEpisode] = useState(0);
  const [reward, setReward] = useState(0);
  const [angleErr, setAngleErr] = useState(0.6);
  const [perturbation, setPerturbation] = useState(1);
  const angleErrRef = useRef(angleErr);
  angleErrRef.current = angleErr;

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // reward is a per-episode cumulative signal, like a real RL training
    // curve: it climbs fastest when the tracked angle stays near zero and
    // resets to 0 at the start of each new episode, rather than climbing
    // forever regardless of how the policy is actually doing.
    const REWARD_ANGLE_THRESHOLD_DEG = 12;

    const episodeTimer = setInterval(() => {
      setEpisode((e) => e + 1);
      setReward(0);
    }, 4000);

    const rewardTimer = setInterval(() => {
      const normalizedErr = Math.min(1, angleErrRef.current / REWARD_ANGLE_THRESHOLD_DEG);
      const stepReward = Math.max(0, 1 - normalizedErr) + Math.random() * 0.15;
      setReward((r) => r + stepReward);
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

      {mode === "double" ? (
        <DoublePendulum onAngleChange={setAngleErr} />
      ) : (
        <CartPole onAngleChange={setAngleErr} perturbation={perturbation} />
      )}

      {mode === "cart" && (
        <div className="flex items-center gap-3 font-mono text-xs text-secondary">
          <label htmlFor="perturbation-slider" className="text-muted">
            perturbation intensity
          </label>
          <input
            id="perturbation-slider"
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={perturbation}
            onChange={(e) => setPerturbation(Number(e.target.value))}
            className="w-32 accent-accent"
          />
          <span className="text-secondary">{perturbation.toFixed(2)}x</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-secondary">
        <span>
          {mode === "double" ? "system: double pendulum" : "policy: state-feedback"}
        </span>
        <span>reward: {reward.toFixed(1)}</span>
        <span>
          {mode === "double" ? "theta1" : "angle err"}: {angleErr.toFixed(2)} deg
        </span>
        <button
          type="button"
          onClick={() => setMode((m) => (m === "double" ? "cart" : "double"))}
          className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent focus-visible:decoration-accent outline-none"
        >
          [ switch to {mode === "double" ? "cart-pole" : "double pendulum"} ]
        </button>
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

// ---------------------------------------------------------------------
// classic (non-inverted) double pendulum: two point masses on rigid,
// massless rods, released from rest under gravity — no control input,
// motion is entirely passive and chaotic. Equations of motion derived
// from the Lagrangian for a double pendulum with a fixed pivot
// (standard form, e.g. Wikipedia "Double pendulum"), integrated with
// RK4 (not Euler) since a first-order integrator visibly leaks energy
// into a chaotic system within seconds and the motion stops looking
// physical.
// ---------------------------------------------------------------------
const DP_GRAVITY = 9.8;
const DP_M1 = 1;
const DP_M2 = 1;
const DP_L1 = 1;
const DP_L2 = 1;

const DP_PX_PER_UNIT = 46;
const DP_ANCHOR_X = 110;
const DP_ANCHOR_Y = 22;
const DP_DT = 1 / 240;

type PendulumState = {
  theta1: number;
  theta2: number;
  omega1: number;
  omega2: number;
};

type PendulumDerivative = {
  dTheta1: number;
  dTheta2: number;
  dOmega1: number;
  dOmega2: number;
};

function dpDerivatives(s: PendulumState): PendulumDerivative {
  const delta = s.theta1 - s.theta2;
  const sinDelta = Math.sin(delta);
  const cosDelta = Math.cos(delta);
  const den = 2 * DP_M1 + DP_M2 - DP_M2 * Math.cos(2 * delta);

  const alpha1 =
    (-DP_GRAVITY * (2 * DP_M1 + DP_M2) * Math.sin(s.theta1) -
      DP_M2 * DP_GRAVITY * Math.sin(s.theta1 - 2 * s.theta2) -
      2 *
        sinDelta *
        DP_M2 *
        (s.omega2 * s.omega2 * DP_L2 +
          s.omega1 * s.omega1 * DP_L1 * cosDelta)) /
    (DP_L1 * den);

  const alpha2 =
    (2 *
      sinDelta *
      (s.omega1 * s.omega1 * DP_L1 * (DP_M1 + DP_M2) +
        DP_GRAVITY * (DP_M1 + DP_M2) * Math.cos(s.theta1) +
        s.omega2 * s.omega2 * DP_L2 * DP_M2 * cosDelta)) /
    (DP_L2 * den);

  return {
    dTheta1: s.omega1,
    dTheta2: s.omega2,
    dOmega1: alpha1,
    dOmega2: alpha2,
  };
}

function dpAddScaled(
  s: PendulumState,
  d: PendulumDerivative,
  scale: number
): PendulumState {
  return {
    theta1: s.theta1 + d.dTheta1 * scale,
    theta2: s.theta2 + d.dTheta2 * scale,
    omega1: s.omega1 + d.dOmega1 * scale,
    omega2: s.omega2 + d.dOmega2 * scale,
  };
}

function dpRk4Step(s: PendulumState, dt: number): PendulumState {
  const k1 = dpDerivatives(s);
  const k2 = dpDerivatives(dpAddScaled(s, k1, dt / 2));
  const k3 = dpDerivatives(dpAddScaled(s, k2, dt / 2));
  const k4 = dpDerivatives(dpAddScaled(s, k3, dt));

  return {
    theta1: s.theta1 + (dt / 6) * (k1.dTheta1 + 2 * k2.dTheta1 + 2 * k3.dTheta1 + k4.dTheta1),
    theta2: s.theta2 + (dt / 6) * (k1.dTheta2 + 2 * k2.dTheta2 + 2 * k3.dTheta2 + k4.dTheta2),
    omega1: s.omega1 + (dt / 6) * (k1.dOmega1 + 2 * k2.dOmega1 + 2 * k3.dOmega1 + k4.dOmega1),
    omega2: s.omega2 + (dt / 6) * (k1.dOmega2 + 2 * k2.dOmega2 + 2 * k3.dOmega2 + k4.dOmega2),
  };
}

function DoublePendulum({
  onAngleChange,
}: {
  onAngleChange: (deg: number) => void;
}) {
  const rod1Ref = useRef<SVGLineElement>(null);
  const rod2Ref = useRef<SVGLineElement>(null);
  const bob1Ref = useRef<SVGCircleElement>(null);
  const bob2Ref = useRef<SVGCircleElement>(null);
  const traceRef = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let state: PendulumState = {
      theta1: 1.2,
      theta2: -1.0,
      omega1: 0,
      omega2: 0,
    };

    let accumulator = 0;
    let lastTime = performance.now();
    let lastReport = 0;
    let raf = 0;
    const tracePoints: string[] = [];

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const frameDt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += frameDt;

      while (accumulator >= DP_DT) {
        state = dpRk4Step(state, DP_DT);
        accumulator -= DP_DT;
      }

      const x1 = DP_ANCHOR_X + Math.sin(state.theta1) * DP_L1 * DP_PX_PER_UNIT;
      const y1 = DP_ANCHOR_Y + Math.cos(state.theta1) * DP_L1 * DP_PX_PER_UNIT;
      const x2 = x1 + Math.sin(state.theta2) * DP_L2 * DP_PX_PER_UNIT;
      const y2 = y1 + Math.cos(state.theta2) * DP_L2 * DP_PX_PER_UNIT;

      rod1Ref.current?.setAttribute("x2", String(x1));
      rod1Ref.current?.setAttribute("y2", String(y1));
      rod2Ref.current?.setAttribute("x1", String(x1));
      rod2Ref.current?.setAttribute("y1", String(y1));
      rod2Ref.current?.setAttribute("x2", String(x2));
      rod2Ref.current?.setAttribute("y2", String(y2));
      bob1Ref.current?.setAttribute("cx", String(x1));
      bob1Ref.current?.setAttribute("cy", String(y1));
      bob2Ref.current?.setAttribute("cx", String(x2));
      bob2Ref.current?.setAttribute("cy", String(y2));

      tracePoints.push(`${x2.toFixed(1)},${y2.toFixed(1)}`);
      if (tracePoints.length > 90) tracePoints.shift();
      traceRef.current?.setAttribute("points", tracePoints.join(" "));

      if (now - lastReport > 220) {
        lastReport = now;
        const deg = (((state.theta1 * 180) / Math.PI) % 360 + 360) % 360;
        onAngleChange(deg > 180 ? deg - 360 : deg);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative h-40 w-full max-w-md overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 220 190"
        className="h-full w-full"
        preserveAspectRatio="xMidYMin meet"
      >
        <polyline
          ref={traceRef}
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <line
          x1={DP_ANCHOR_X}
          y1={DP_ANCHOR_Y}
          x2={DP_ANCHOR_X}
          y2={DP_ANCHOR_Y + DP_L1 * DP_PX_PER_UNIT}
          ref={rod1Ref}
          stroke="var(--color-graphite)"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
        <line ref={rod2Ref} stroke="var(--color-accent)" strokeWidth="2" />
        <circle
          cx={DP_ANCHOR_X}
          cy={DP_ANCHOR_Y}
          r="3"
          fill="var(--color-graphite)"
          fillOpacity="0.7"
        />
        <circle ref={bob1Ref} r="6" fill="var(--color-graphite)" />
        <circle ref={bob2Ref} r="6" fill="var(--color-accent)" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------
// cart-pole: nonlinear inverted-pendulum-on-a-cart dynamics (the classic
// control-theory benchmark), integrated with a fixed-step semi-implicit
// Euler loop and stabilized with a hand-tuned state-feedback controller:
// F = k1*theta + k2*thetaDot + k3*x + k4*xDot. Gains were tuned offline
// by simulating step response + random angular-velocity perturbations
// until the closed loop stayed bounded over long horizons.
// ---------------------------------------------------------------------
const CP_GRAVITY = 9.8;
const CP_CART_MASS = 1.0;
const CP_POLE_MASS = 0.1;
const CP_HALF_POLE_LENGTH = 0.5;
const CP_TOTAL_MASS = CP_CART_MASS + CP_POLE_MASS;
const CP_POLE_MASS_LENGTH = CP_POLE_MASS * CP_HALF_POLE_LENGTH;

const CP_K_THETA = 20;
const CP_K_THETA_DOT = 5;
const CP_K_X = 0.6;
const CP_K_X_DOT = 0.9;
const CP_FORCE_CLAMP = 25;

const CP_PX_PER_UNIT = 36;
const CP_MAX_TRANSLATE_PX = 170;
const CP_DT = 1 / 60;

function cpDynamics(
  x: number,
  xDot: number,
  theta: number,
  thetaDot: number,
  force: number
) {
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const temp =
    (force + CP_POLE_MASS_LENGTH * thetaDot * thetaDot * sinT) / CP_TOTAL_MASS;
  const thetaAcc =
    (CP_GRAVITY * sinT - cosT * temp) /
    (CP_HALF_POLE_LENGTH * (4 / 3 - (CP_POLE_MASS * cosT * cosT) / CP_TOTAL_MASS));
  const xAcc = temp - (CP_POLE_MASS_LENGTH * thetaAcc * cosT) / CP_TOTAL_MASS;
  return { xAcc, thetaAcc };
}

function CartPole({
  onAngleChange,
  perturbation,
}: {
  onAngleChange: (deg: number) => void;
  perturbation: number;
}) {
  const cartRef = useRef<HTMLDivElement>(null);
  const poleRef = useRef<HTMLDivElement>(null);
  const perturbationRef = useRef(perturbation);
  perturbationRef.current = perturbation;

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

      while (accumulator >= CP_DT) {
        elapsed += CP_DT;
        if (elapsed >= nextPerturbAt) {
          state.thetaDot += (Math.random() - 0.5) * 1.2 * perturbationRef.current;
          nextPerturbAt = elapsed + 1.2 + Math.random() * 1.4;
        }

        const force = Math.max(
          -CP_FORCE_CLAMP,
          Math.min(
            CP_FORCE_CLAMP,
            CP_K_THETA * state.theta +
              CP_K_THETA_DOT * state.thetaDot +
              CP_K_X * state.x +
              CP_K_X_DOT * state.xDot
          )
        );

        const { xAcc, thetaAcc } = cpDynamics(
          state.x,
          state.xDot,
          state.theta,
          state.thetaDot,
          force
        );

        state.xDot += xAcc * CP_DT;
        state.x += state.xDot * CP_DT;
        state.thetaDot += thetaAcc * CP_DT;
        state.theta += state.thetaDot * CP_DT;

        accumulator -= CP_DT;
      }

      const translatePx = Math.max(
        -CP_MAX_TRANSLATE_PX,
        Math.min(CP_MAX_TRANSLATE_PX, state.x * CP_PX_PER_UNIT)
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
      className="relative h-40 w-full max-w-md overflow-hidden"
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
