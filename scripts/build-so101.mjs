// Builds the compact SO-101 model used by the hero arm simulation.
//
// Source: TheRobotStudio/SO-ARM100 (Apache-2.0), Simulation/SO101,
// pinned to a fixed commit so the output is reproducible. The raw
// visual meshes are ~16 MB of binary STL; this script merges every
// visual of a link into one indexed mesh per material, decimates it with
// meshoptimizer, and packs the result into a single binary plus a JSON
// manifest holding the kinematic tree (joint origins, axes, limits).
//
//   node scripts/build-so101.mjs
//
// Output: public/models/so101/{so101.bin, so101.json, LICENSE}

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { MeshoptSimplifier } from "meshoptimizer";

const COMMIT = "5f6d2b876a53a4872e405b991dd925556c9e38a4";
const RAW = `https://raw.githubusercontent.com/TheRobotStudio/SO-ARM100/${COMMIT}`;
const URDF_PATH = "Simulation/SO101/so101_new_calib.urdf";

// fraction of triangles kept per mesh, and the floor/ceiling per mesh.
// Servos are repeated five times and visually simple, so they get the
// most aggressive reduction.
const KEEP_RATIO = { "3d_printed": 0.06, sts3215: 0.03 };
const MIN_TRIS = 200;
const MAX_ERROR = 0.02; // relative to mesh extent

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "models", "so101");
const cacheDir = path.join(tmpdir(), `so101-${COMMIT.slice(0, 8)}`);

async function cached(relPath) {
  const file = path.join(cacheDir, relPath);
  try {
    await access(file);
  } catch {
    const res = await fetch(`${RAW}/${relPath}`);
    if (!res.ok) throw new Error(`fetch ${relPath}: ${res.status}`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFile(file);
}

// --- minimal URDF parsing (the file is machine-generated and regular) ---
const nums = (s) => s.trim().split(/\s+/).map(Number);
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
};

function parseUrdf(xml) {
  const links = [];
  for (const m of xml.matchAll(/<link name="([^"]+)">([\s\S]*?)<\/link>/g)) {
    const visuals = [];
    for (const v of m[2].matchAll(/<visual>([\s\S]*?)<\/visual>/g)) {
      const origin = v[1].match(/<origin[^>]*\/>/)[0];
      visuals.push({
        xyz: nums(attr(origin, "xyz")),
        rpy: nums(attr(origin, "rpy")),
        mesh: attr(v[1].match(/<mesh[^>]*\/>/)[0], "filename"),
        material: attr(v[1].match(/<material[^>]*\/>/)[0], "name"),
      });
    }
    links.push({ name: m[1], visuals });
  }

  const joints = [];
  for (const m of xml.matchAll(/<joint name="([^"]+)" type="([^"]+)">([\s\S]*?)<\/joint>/g)) {
    const body = m[3];
    const origin = body.match(/<origin[^>]*\/>/)[0];
    const limit = body.match(/<limit[^>]*\/>/);
    joints.push({
      name: m[1],
      type: m[2],
      parent: attr(body.match(/<parent[^>]*\/>/)[0], "link"),
      child: attr(body.match(/<child[^>]*\/>/)[0], "link"),
      xyz: nums(attr(origin, "xyz")),
      rpy: nums(attr(origin, "rpy")),
      axis: nums(attr(body.match(/<axis[^>]*\/>/)[0], "xyz")),
      lower: limit ? Number(attr(limit[0], "lower")) : 0,
      upper: limit ? Number(attr(limit[0], "upper")) : 0,
    });
  }
  return { links, joints };
}

// URDF rpy is R = Rz(yaw) * Ry(pitch) * Rx(roll), which is three's 'ZYX'
function originMatrix(xyz, rpy) {
  const q = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(rpy[0], rpy[1], rpy[2], "ZYX")
  );
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...xyz),
    q,
    new THREE.Vector3(1, 1, 1)
  );
}

function readBinaryStl(buf, matrix, out) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const count = view.getUint32(80, true);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const base = 84 + i * 50 + 12; // skip the stored normal
    for (let k = 0; k < 3; k++) {
      const o = base + k * 12;
      v.set(view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true));
      v.applyMatrix4(matrix);
      out.push(v.x, v.y, v.z);
    }
  }
}

// weld coincident vertices so the simplifier sees connected topology
function weld(soup) {
  const map = new Map();
  const positions = [];
  const indices = new Uint32Array(soup.length / 3);
  for (let i = 0; i < soup.length; i += 3) {
    const key = `${Math.round(soup[i] * 1e5)},${Math.round(soup[i + 1] * 1e5)},${Math.round(soup[i + 2] * 1e5)}`;
    let idx = map.get(key);
    if (idx === undefined) {
      idx = positions.length / 3;
      map.set(key, idx);
      positions.push(soup[i], soup[i + 1], soup[i + 2]);
    }
    indices[i / 3] = idx;
  }
  return { positions: new Float32Array(positions), indices };
}

// drop vertices the simplified index buffer no longer references
function compact(positions, indices) {
  const remap = new Int32Array(positions.length / 3).fill(-1);
  const out = [];
  const idx = new Uint16Array(indices.length);
  for (let i = 0; i < indices.length; i++) {
    let r = remap[indices[i]];
    if (r < 0) {
      r = out.length / 3;
      remap[indices[i]] = r;
      const s = indices[i] * 3;
      out.push(positions[s], positions[s + 1], positions[s + 2]);
    }
    if (r > 65535) throw new Error("mesh too large for 16-bit indices");
    idx[i] = r;
  }
  return { positions: new Float32Array(out), indices: idx };
}

async function main() {
  await MeshoptSimplifier.ready;
  const urdf = (await cached(URDF_PATH)).toString("utf8");
  const { links, joints } = parseUrdf(urdf);
  const meshDir = path.posix.dirname(URDF_PATH);

  const chunks = [];
  let byteOffset = 0;
  const push = (typed) => {
    const off = byteOffset;
    chunks.push(Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength));
    byteOffset += typed.byteLength;
    // keep every chunk 4-byte aligned for Float32Array views
    const pad = (4 - (byteOffset % 4)) % 4;
    if (pad) {
      chunks.push(Buffer.alloc(pad));
      byteOffset += pad;
    }
    return off;
  };

  let rawTris = 0;
  let keptTris = 0;
  const manifestLinks = [];

  for (const link of links) {
    const byMaterial = new Map();
    for (const vis of link.visuals) {
      const soup = byMaterial.get(vis.material) ?? [];
      const stl = await cached(path.posix.join(meshDir, vis.mesh));
      readBinaryStl(stl, originMatrix(vis.xyz, vis.rpy), soup);
      byMaterial.set(vis.material, soup);
    }

    const parts = [];
    for (const [material, soup] of byMaterial) {
      const { positions, indices } = weld(soup);
      const tris = indices.length / 3;
      const target = Math.max(MIN_TRIS, Math.round(tris * KEEP_RATIO[material])) * 3;
      let [simplified] = MeshoptSimplifier.simplify(indices, positions, 3, target, MAX_ERROR);
      if (simplified.length > target * 1.5) {
        // topology too fragmented for edge collapse; fall back to sloppy
        [simplified] = MeshoptSimplifier.simplifySloppy(indices, positions, 3, null, target, MAX_ERROR);
      }
      const packed = compact(positions, simplified);
      rawTris += tris;
      keptTris += packed.indices.length / 3;
      parts.push({
        material,
        positions: { offset: push(packed.positions), count: packed.positions.length },
        indices: { offset: push(packed.indices), count: packed.indices.length },
      });
    }
    manifestLinks.push({ name: link.name, parts });
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "so101.bin"), Buffer.concat(chunks));
  await writeFile(
    path.join(outDir, "so101.json"),
    JSON.stringify(
      {
        source: `TheRobotStudio/SO-ARM100@${COMMIT} ${URDF_PATH} (Apache-2.0)`,
        bytes: byteOffset,
        links: manifestLinks,
        joints: joints.map(({ name, type, parent, child, xyz, rpy, axis, lower, upper }) => ({
          name, type, parent, child, xyz, rpy, axis, lower, upper,
        })),
      },
      null,
      1
    )
  );
  await writeFile(path.join(outDir, "LICENSE"), await cached("LICENSE"));

  console.log(
    `so101: ${rawTris} -> ${keptTris} triangles, ${(byteOffset / 1024).toFixed(0)} KB -> ${path.relative(root, outDir)}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
