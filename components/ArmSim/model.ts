// Loads the packed SO-101 model (see scripts/build-so101.mjs) and builds a
// three.js scene graph that mirrors the URDF tree: for every joint an
// `origin` node holding the fixed joint transform, and under it a `pivot`
// node that rotates about the joint axis.

import * as THREE from "three";
import { type ArmManifest, originMatrix } from "./kinematics";

export const MODEL_URL = "/models/so101";

export function webglAvailable(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export type LoadedArm = {
  manifest: ArmManifest;
  geometries: Map<string, { material: string; geometry: THREE.BufferGeometry }[]>;
};

export async function loadArm(signal?: AbortSignal): Promise<LoadedArm> {
  const [manifest, bin] = await Promise.all([
    fetch(`${MODEL_URL}/so101.json`, { signal }).then((r) => {
      if (!r.ok) throw new Error(`so101.json: ${r.status}`);
      return r.json() as Promise<ArmManifest>;
    }),
    fetch(`${MODEL_URL}/so101.bin`, { signal }).then((r) => {
      if (!r.ok) throw new Error(`so101.bin: ${r.status}`);
      return r.arrayBuffer();
    }),
  ]);

  const geometries: LoadedArm["geometries"] = new Map();
  for (const link of manifest.links) {
    geometries.set(
      link.name,
      link.parts.map((part) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array(bin, part.positions.offset, part.positions.count),
            3
          )
        );
        geometry.setIndex(
          new THREE.BufferAttribute(new Uint16Array(bin, part.indices.offset, part.indices.count), 1)
        );
        geometry.computeBoundingSphere();
        return { material: part.material, geometry };
      })
    );
  }
  return { manifest, geometries };
}

export type ArmObject = {
  /** base_link frame (URDF, Z-up) */
  base: THREE.Group;
  pivots: Map<string, { node: THREE.Object3D; axis: THREE.Vector3 }>;
};

export function buildArmObject(
  arm: LoadedArm,
  materials: Record<string, THREE.Material>
): ArmObject {
  const linkNodes = new Map<string, THREE.Group>();
  for (const link of arm.manifest.links) {
    const g = new THREE.Group();
    g.name = link.name;
    for (const part of arm.geometries.get(link.name) ?? []) {
      const mesh = new THREE.Mesh(part.geometry, materials[part.material]);
      mesh.castShadow = true;
      g.add(mesh);
    }
    linkNodes.set(link.name, g);
  }

  const pivots: ArmObject["pivots"] = new Map();
  for (const joint of arm.manifest.joints) {
    const parent = linkNodes.get(joint.parent);
    const child = linkNodes.get(joint.child);
    if (!parent || !child) continue;
    const origin = new THREE.Object3D();
    originMatrix(joint.xyz, joint.rpy).decompose(origin.position, origin.quaternion, origin.scale);
    const pivot = new THREE.Object3D();
    origin.add(pivot);
    pivot.add(child);
    parent.add(origin);
    if (joint.type === "revolute") {
      pivots.set(joint.name, { node: pivot, axis: new THREE.Vector3(...joint.axis).normalize() });
    }
  }

  const base = linkNodes.get("base_link");
  if (!base) throw new Error("base_link missing");
  return { base, pivots };
}
