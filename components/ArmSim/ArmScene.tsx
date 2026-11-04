"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildChain } from "./kinematics";
import {
  ANGLE_MAX,
  ArmController,
  CUBE_SIZE,
  PAN_X,
  R_MAX,
  R_MIN,
  type Telemetry,
} from "./controller";
import { buildArmObject, loadArm, webglAvailable, type LoadedArm } from "./model";

// URDF base frame is Z-up; three is Y-up. base (x, y, z) -> world (x, z, -y)
const BASE_TO_WORLD = new THREE.Euler(-Math.PI / 2, 0, 0);

const TRAIL_POINTS = 140;
const POINTER_IDLE_MS = 1800;
const TELEMETRY_MS = 200;

type Palette = {
  paper: string;
  graphite: string;
  accent: string;
  line: string;
  printed: string;
};

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    paper: v("--color-paper", "#f6f4ee"),
    graphite: v("--color-graphite", "#1b1a17"),
    accent: v("--color-accent", "#3e6e96"),
    // the line token carries alpha; the grid shader wants an opaque base
    line: v("--color-secondary", "#6b6960"),
    // printed parts: a shade below the paper so the silhouette reads
    printed: v("--color-card-hover", "#e9e6da"),
  };
}

// --- table: fading grid plus the reachable band, drawn in a shader ---------
const tableVertex = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy; // base-frame table coordinates (metres)
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const tableFragment = /* glsl */ `
  uniform vec3 uLine;
  uniform vec3 uAccent;
  uniform float uPanX;
  uniform float uRMin;
  uniform float uRMax;
  uniform float uAngleMax;
  varying vec2 vPos;

  float gridLine(vec2 p, float spacing, float width) {
    vec2 g = abs(fract(p / spacing - 0.5) - 0.5) * spacing;
    vec2 aa = fwidth(p) * 1.2;
    vec2 l = 1.0 - smoothstep(vec2(width) - aa, vec2(width) + aa, g);
    return max(l.x, l.y);
  }

  void main() {
    float d = length(vPos - vec2(0.12, 0.0));
    float fade = 1.0 - smoothstep(0.12, 0.34, d);
    float grid = gridLine(vPos, 0.025, 0.00025) * 0.22 * fade;

    // reachable band: annulus sector about the pan axis
    vec2 rel = vPos - vec2(uPanX, 0.0);
    float r = length(rel);
    float a = abs(atan(rel.y, rel.x));
    float aaR = fwidth(r) * 1.2;
    float inside = smoothstep(uRMin - aaR, uRMin + aaR, r) *
                   (1.0 - smoothstep(uRMax - aaR, uRMax + aaR, r)) *
                   (1.0 - smoothstep(uAngleMax - 0.01, uAngleMax + 0.01, a));
    float edge = (1.0 - smoothstep(0.0, aaR * 1.5, abs(r - uRMin))) +
                 (1.0 - smoothstep(0.0, aaR * 1.5, abs(r - uRMax)));
    edge *= 1.0 - smoothstep(uAngleMax - 0.01, uAngleMax + 0.01, a);
    // dashed outline: modulate the arcs by angle
    edge *= step(0.5, fract(a * r / 0.006));

    vec3 col = uLine;
    float alpha = grid;
    alpha = max(alpha, inside * 0.05);
    col = mix(col, uAccent, inside);
    alpha = max(alpha, edge * 0.45);
    gl_FragColor = vec4(col, alpha);
  }
`;

function Table({ palette }: { palette: Palette }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: tableVertex,
        fragmentShader: tableFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uLine: { value: new THREE.Color(palette.line) },
          uAccent: { value: new THREE.Color(palette.accent) },
          uPanX: { value: PAN_X },
          uRMin: { value: R_MIN },
          uRMax: { value: R_MAX },
          uAngleMax: { value: ANGLE_MAX },
        },
      }),
    [palette]
  );
  return (
    <>
      {/* centred on the base origin: the shader reads plane-local xy as
          base-frame table coordinates */}
      <mesh material={material} renderOrder={-1}>
        <planeGeometry args={[0.9, 0.9]} />
      </mesh>
      <mesh position={[0, 0, 0.0005]} receiveShadow>
        <planeGeometry args={[0.9, 0.9]} />
        <shadowMaterial opacity={0.14} color={palette.graphite} />
      </mesh>
    </>
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  useEffect(() => {
    // three-quarter side view so the links read in profile; pull back on
    // narrow (phone) canvases where the workspace has to fit the width
    const aspect = size.width / Math.max(1, size.height);
    const distance = aspect < 1.8 ? 1.18 : 0.9;
    const azimuth = (-58 * Math.PI) / 180; // about the base's vertical axis
    const elevation = (26 * Math.PI) / 180;
    const target = new THREE.Vector3(0.11, 0.105, 0); // world (Y-up)
    // spherical offset in the base frame, mapped base (x, y, z) -> world (x, z, -y)
    const h = distance * Math.cos(elevation);
    camera.position.set(
      target.x + h * Math.cos(azimuth),
      target.y + distance * Math.sin(elevation),
      target.z - h * Math.sin(azimuth)
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

type RigProps = {
  arm: LoadedArm;
  palette: Palette;
  reducedMotion: boolean;
  pointer: React.RefObject<{ goal: THREE.Vector3 | null; at: number }>;
  onTelemetry: (t: Telemetry) => void;
};

function ArmRig({ arm, palette, reducedMotion, pointer, onTelemetry }: RigProps) {
  const controller = useMemo(() => {
    const c = new ArmController(buildChain(arm.manifest.joints));
    // start mid-task rather than from the folded pose
    if (reducedMotion) for (let i = 0; i < 120; i++) c.step(1 / 60);
    return c;
  }, [arm, reducedMotion]);

  const object = useMemo(() => {
    const flat = { flatShading: true, metalness: 0 };
    return buildArmObject(arm, {
      "3d_printed": new THREE.MeshStandardMaterial({ ...flat, color: palette.printed, roughness: 0.85 }),
      sts3215: new THREE.MeshStandardMaterial({ ...flat, color: palette.graphite, roughness: 0.55 }),
    });
  }, [arm, palette]);

  const cubeRef = useRef<THREE.Mesh>(null);
  const targetRef = useRef<THREE.Group>(null);
  const cursorRef = useRef<THREE.Group>(null);
  const trail = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(TRAIL_POINTS * 3), 3)
    );
    geometry.setDrawRange(0, 0);
    const material = new THREE.LineBasicMaterial({
      color: palette.accent,
      transparent: true,
      opacity: 0.35,
    });
    return new THREE.Line(geometry, material);
  }, [palette]);
  const trailCount = useRef(0);

  const lastTelemetry = useRef(0);

  useFrame((_, delta) => {
    const now = performance.now();
    const p = pointer.current;
    if (!reducedMotion) {
      const live = p.goal && now - p.at < POINTER_IDLE_MS;
      controller.setTeleop(live ? p.goal : null);
      controller.step(Math.min(delta, 1 / 30));
    }

    for (let i = 0; i < 5; i++) {
      const name = ["shoulder_pan", "shoulder_lift", "elbow_flex", "wrist_flex", "wrist_roll"][i];
      const pv = object.pivots.get(name);
      pv?.node.quaternion.setFromAxisAngle(pv.axis, controller.q[i]);
    }
    const jaw = object.pivots.get("gripper");
    jaw?.node.quaternion.setFromAxisAngle(jaw.axis, controller.gripper);

    if (cubeRef.current) {
      cubeRef.current.position.copy(controller.cube.position);
      cubeRef.current.quaternion.copy(controller.cube.quaternion);
    }
    if (targetRef.current) {
      targetRef.current.position.set(controller.placeTarget.x, controller.placeTarget.y, 0.0008);
      targetRef.current.visible = controller.phase !== "teleop";
    }
    if (cursorRef.current) {
      const show = controller.phase === "teleop";
      cursorRef.current.visible = show;
      if (show) cursorRef.current.position.set(controller.reference.x, controller.reference.y, 0.0008);
    }

    // TCP trail (measured, not reference, so servo lag is visible)
    if (!reducedMotion) {
      const attr = trail.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const tcp = controller.measuredTcp();
      if (trailCount.current < TRAIL_POINTS) trailCount.current++;
      arr.copyWithin(3, 0, (TRAIL_POINTS - 1) * 3);
      arr[0] = tcp.x;
      arr[1] = tcp.y;
      arr[2] = tcp.z;
      attr.needsUpdate = true;
      trail.geometry.setDrawRange(0, trailCount.current);
    }

    if (now - lastTelemetry.current > TELEMETRY_MS) {
      lastTelemetry.current = now;
      onTelemetry(controller.telemetry());
    }
  });

  return (
    <group rotation={BASE_TO_WORLD}>
      <primitive object={object.base} />
      <primitive object={trail} />
      <mesh ref={cubeRef} castShadow>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshStandardMaterial color={palette.accent} roughness={0.6} flatShading />
      </mesh>
      {/* place target: where the planner will set the cube down next */}
      <group ref={targetRef}>
        <mesh>
          <ringGeometry args={[CUBE_SIZE * 0.72, CUBE_SIZE * 0.8, 48]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      </group>
      {/* teleop goal under the cursor */}
      <group ref={cursorRef} visible={false}>
        <mesh>
          <ringGeometry args={[0.006, 0.0075, 32]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={0.8} depthWrite={false} />
        </mesh>
      </group>
      <Table palette={palette} />
    </group>
  );
}

export type ArmSceneProps = {
  reducedMotion: boolean;
  onTelemetry: (t: Telemetry) => void;
  onError: () => void;
};

export default function ArmScene({ reducedMotion, onTelemetry, onError }: ArmSceneProps) {
  const [arm, setArm] = useState<LoadedArm | null>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [visible, setVisible] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ goal: THREE.Vector3 | null; at: number }>({ goal: null, at: 0 });
  const cameraRef = useRef<THREE.Camera | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    if (!webglAvailable()) {
      onError();
      return;
    }
    loadArm(ctrl.signal)
      .then((loaded) => {
        setPalette(readPalette());
        setArm(loaded);
      })
      .catch((err) => {
        if (!ctrl.signal.aborted) {
          console.warn("arm sim unavailable:", err);
          onError();
        }
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stop rendering while the hero is scrolled out of view
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // cursor -> point on the table (base frame), for teleop
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reducedMotion) return;
    const raycaster = new THREE.Raycaster();
    const table = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const ndc = new THREE.Vector2();

    function move(e: PointerEvent) {
      if (e.pointerType === "touch" || !cameraRef.current || !el) return;
      const rect = el.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, cameraRef.current);
      if (!raycaster.ray.intersectPlane(table, hit)) return;
      // world (x, y, z) -> base (x, -z, y)
      pointer.current.goal = new THREE.Vector3(hit.x, -hit.z, hit.y);
      pointer.current.at = performance.now();
    }
    function leave() {
      pointer.current.goal = null;
    }
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reducedMotion]);

  const ready = arm && palette;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {ready && (
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          frameloop={reducedMotion ? "demand" : visible ? "always" : "never"}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          camera={{ fov: 24, near: 0.01, far: 5, position: [0.56, 0.3, 0.2] }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
        >
          <CameraRig />
          <hemisphereLight args={["#ffffff", palette.printed, 1.7]} />
          <directionalLight
            position={[0.25, 0.9, 0.45]}
            intensity={2.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-0.35}
            shadow-camera-right={0.35}
            shadow-camera-top={0.35}
            shadow-camera-bottom={-0.35}
            shadow-camera-near={0.1}
            shadow-camera-far={2}
            shadow-bias={-0.0005}
            shadow-normalBias={0.002}
          />
          <ArmRig
            arm={arm}
            palette={palette}
            reducedMotion={reducedMotion}
            pointer={pointer}
            onTelemetry={onTelemetry}
          />
        </Canvas>
      )}
    </div>
  );
}
