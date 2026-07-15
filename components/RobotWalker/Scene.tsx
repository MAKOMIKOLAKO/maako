"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import RobotModel from "./RobotModel";
import {
  STRIDE_SECONDS,
  MOVE_SPEED,
  ARRIVE_RADIUS,
  TARGET_REEVAL_MS,
  FULL_LEG,
  legPose,
  hipHeightForStance,
} from "./physics";

const WORLD_HALF_WIDTH = 3.4;
const WORLD_HALF_DEPTH = 1.9;
const CAMERA_ZOOM = 150;
const CAMERA_ANGLE_DEG = 58;
const CAMERA_DISTANCE = 3.4;
const POINTER_IDLE_TIMEOUT = 2800; // ms since last real cursor move before wandering
const NEUTRAL_HIP_Y = FULL_LEG;

function randomWanderPoint() {
  return new THREE.Vector3(
    (Math.random() * 2 - 1) * WORLD_HALF_WIDTH * 0.8,
    0,
    (Math.random() * 2 - 1) * WORLD_HALF_DEPTH * 0.8
  );
}

function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    const angle = (CAMERA_ANGLE_DEG * Math.PI) / 180;
    const height = CAMERA_DISTANCE * Math.sin(angle);
    const back = CAMERA_DISTANCE * Math.cos(angle);
    camera.position.set(0, height, back);
    camera.lookAt(0, 0.42, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function Controller({ reducedMotion }: { reducedMotion: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  const pointerScreen = useRef({ x: 0, y: 0 });
  const lastPointerMoveAt = useRef(-Infinity);
  const lastTargetSampleAt = useRef(-Infinity);
  const target = useRef(randomWanderPoint());
  const pos = useRef(new THREE.Vector3(0, 0, 0));
  const facing = useRef(0);
  const gaitPhase = useRef(0);
  const idlePhase = useRef(0);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const groundPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );
  const { camera } = useThree();

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      pointerScreen.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerScreen.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastPointerMoveAt.current = performance.now();
    }
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(0.05, rawDelta || 1 / 60);
    const now = performance.now();
    const cursorActive =
      now - lastPointerMoveAt.current < POINTER_IDLE_TIMEOUT;

    // --- target selection: sampled periodically, not chased every frame ---
    if (!reducedMotion) {
      if (cursorActive) {
        if (now - lastTargetSampleAt.current > TARGET_REEVAL_MS) {
          raycaster.setFromCamera(
            new THREE.Vector2(pointerScreen.current.x, pointerScreen.current.y),
            camera
          );
          const hit = new THREE.Vector3();
          if (raycaster.ray.intersectPlane(groundPlane, hit)) {
            target.current.set(
              THREE.MathUtils.clamp(hit.x, -WORLD_HALF_WIDTH, WORLD_HALF_WIDTH),
              0,
              THREE.MathUtils.clamp(hit.z, -WORLD_HALF_DEPTH, WORLD_HALF_DEPTH)
            );
          }
          lastTargetSampleAt.current = now;
        }
      } else if (pos.current.distanceTo(target.current) < ARRIVE_RADIUS) {
        target.current.copy(randomWanderPoint());
      }
    }

    // --- constant-speed translation, no easing ---
    const toTarget = new THREE.Vector3().subVectors(target.current, pos.current);
    const dist = toTarget.length();
    let walking = false;

    if (!reducedMotion && dist > ARRIVE_RADIUS) {
      const dir = toTarget.clone().normalize();
      const step = Math.min(MOVE_SPEED * dt, dist - ARRIVE_RADIUS);
      pos.current.addScaledVector(dir, step);
      walking = true;

      const desiredFacing = Math.atan2(dir.x, dir.z);
      let diff = desiredFacing - facing.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      facing.current += diff * Math.min(1, 6 * dt);
    }

    // --- gait: hip height driven by whichever leg is currently planted,
    // so the stance foot's world position never slides. ---
    let leftHip = 0;
    let leftKnee = 0;
    let rightHip = 0;
    let rightKnee = 0;
    let hipY = NEUTRAL_HIP_Y;

    if (!reducedMotion) {
      if (walking) {
        gaitPhase.current = (gaitPhase.current + dt / STRIDE_SECONDS) % 1;
        const left = legPose(gaitPhase.current, 0);
        const right = legPose(gaitPhase.current, 0.5);
        leftHip = left.hip;
        leftKnee = left.knee;
        rightHip = right.hip;
        rightKnee = right.knee;
        const stanceRelZ = left.planted ? left.relZ : right.relZ;
        hipY = hipHeightForStance(stanceRelZ);
      } else {
        idlePhase.current += dt;
        const sway = Math.sin(idlePhase.current * 0.8) * 0.04;
        leftHip = sway;
        rightHip = -sway;
        leftKnee = 0.05;
        rightKnee = 0.05;
        hipY = NEUTRAL_HIP_Y + Math.sin(idlePhase.current * 0.8) * 0.004;
      }
    }

    if (rootRef.current) {
      rootRef.current.position.set(pos.current.x, 0, pos.current.z);
      rootRef.current.rotation.y = facing.current;
    }
    if (bobRef.current) bobRef.current.position.y = hipY;
    if (leftHipRef.current) leftHipRef.current.rotation.x = leftHip;
    if (leftKneeRef.current)
      leftKneeRef.current.rotation.x = Math.max(0, leftKnee);
    if (rightHipRef.current) rightHipRef.current.rotation.x = rightHip;
    if (rightKneeRef.current)
      rightKneeRef.current.rotation.x = Math.max(0, rightKnee);
  });

  return (
    <group ref={rootRef}>
      <RobotModel
        bobRef={bobRef}
        leftHipRef={leftHipRef}
        leftKneeRef={leftKneeRef}
        rightHipRef={rightHipRef}
        rightKneeRef={rightKneeRef}
      />
    </group>
  );
}

export default function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: CAMERA_ZOOM, near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NoToneMapping,
      }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <CameraRig />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 2]} intensity={0.9} />
      <directionalLight position={[-2, 2, -1]} intensity={0.35} />
      <Controller reducedMotion={reducedMotion} />
    </Canvas>
  );
}
