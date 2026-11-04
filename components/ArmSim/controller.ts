// Task-level control for the SO-101 hero sim. Everything here is plain
// math on the URDF chain (no rendering), in the URDF base frame: Z-up,
// metres, radians.
//
// Pipeline each tick:
//   task planner -> min-jerk Cartesian reference (in cylindrical coords
//   about the pan axis, so moves sweep around the base instead of cutting
//   through it) -> damped-least-squares IK -> joint reference -> per-joint
//   second-order servo model (the STS3215s are position-controlled, so the
//   measured joints lag the reference) -> forward kinematics of the
//   measured joints drives the cube when grasped.

import * as THREE from "three";
import {
  type Chain,
  forward,
  jawAxis,
  minJerk,
  solveIk,
  tcpPosition,
} from "./kinematics";

// pan axis location in the base frame (shoulder_pan joint origin)
export const PAN_X = 0.0388;
export const R_MIN = 0.15; // closer in, the arm folds over its own base
export const R_MAX = 0.215;
export const ANGLE_MAX = (70 * Math.PI) / 180;

export const CUBE_SIZE = 0.024;
const HOVER_Z = 0.075;
const GRASP_Z = CUBE_SIZE / 2; // TCP (jaw-gap centre) at the cube's centre
const PLACE_Z = GRASP_Z + 0.004; // release a few mm up, then it drops

// gripper joint values (rad): open (~50 mm between fingertips), and
// closed on a cube of CUBE_SIZE (moving jaw's inner face reaches x = 16 mm)
export const GRIPPER_OPEN = 0.55;
export const GRIPPER_CLOSED = 0.115;

// servo model: critically-ish damped second order per joint
const SERVO_WN = 26; // rad/s natural frequency
const SERVO_ZETA = 0.85;
const SERVO_MAX_VEL = 4.5; // rad/s, roughly STS3215 no-load speed
const SUBSTEP = 1 / 480;

const DOWN = new THREE.Vector3(0, 0, -1);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const APPROACH_WEIGHT = 0.06;

export type Phase =
  | "approach"
  | "descend"
  | "grasp"
  | "lift"
  | "transport"
  | "place"
  | "release"
  | "retreat"
  | "teleop";

type Cyl = { a: number; r: number; z: number };

const toCyl = (p: THREE.Vector3): Cyl => ({
  a: Math.atan2(p.y, p.x - PAN_X),
  r: Math.hypot(p.x - PAN_X, p.y),
  z: p.z,
});
const fromCyl = (c: Cyl, out: THREE.Vector3) =>
  out.set(PAN_X + c.r * Math.cos(c.a), c.r * Math.sin(c.a), c.z);

function randomSpot(avoid: Cyl | null): Cyl {
  for (let i = 0; i < 40; i++) {
    const c = {
      a: (Math.random() * 2 - 1) * ANGLE_MAX * 0.85,
      r: R_MIN + 0.01 + Math.random() * (R_MAX - R_MIN - 0.02),
      z: 0,
    };
    // keep successive spots far enough apart that the move reads clearly
    if (!avoid || Math.abs(c.a - avoid.a) > 0.7) return c;
  }
  return { a: avoid && avoid.a > 0 ? -0.6 : 0.6, r: 0.17, z: 0 };
}

const wrapQuarter = (x: number) => {
  // nearest equivalent of x modulo pi/2, in [-pi/4, pi/4]
  const q = Math.PI / 2;
  return x - q * Math.round(x / q);
};

type Segment = {
  from: Cyl;
  to: Cyl;
  rollFrom: number;
  rollTo: number;
  gripFrom: number;
  gripTo: number;
  duration: number;
  t: number;
};

export type Telemetry = {
  phase: Phase;
  jointsDeg: number[];
  trackingErrorMm: number;
  cycles: number;
};

export class ArmController {
  readonly chain: Chain;
  /** measured joint positions (servo outputs) */
  readonly q = [0, -1.2, 1.1, 1.3, 0];
  readonly qd = [0, 0, 0, 0, 0];
  /** reference joint positions (IK output, servo input) */
  readonly qRef: number[];
  gripper = GRIPPER_OPEN;
  gripperRef = GRIPPER_OPEN;

  readonly cube = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    yaw: 0,
    vz: 0,
    attached: false,
    /** cube pose in the TCP frame while grasped */
    offset: new THREE.Matrix4(),
  };
  readonly placeTarget = new THREE.Vector3();

  phase: Phase = "approach";
  cycles = 0;

  private seg: Segment | null = null;
  private pickSpot: Cyl;
  private placeSpot: Cyl;
  private roll = 0;
  private readonly ref = new THREE.Vector3(); // Cartesian TCP reference
  private teleopGoal: THREE.Vector3 | null = null;

  constructor(chain: Chain) {
    this.chain = chain;
    this.qRef = [...this.q];
    this.pickSpot = randomSpot(null);
    this.placeSpot = randomSpot(this.pickSpot);
    fromCyl(this.pickSpot, this.cube.position).setZ(CUBE_SIZE / 2);
    this.cube.yaw = (Math.random() - 0.5) * 1.2;
    this.cube.quaternion.setFromAxisAngle(Z_AXIS, this.cube.yaw);
    fromCyl(this.placeSpot, this.placeTarget);
    tcpPosition(chain, this.q, this.ref);
    this.startPhase("approach");
  }

  /** current TCP reference (base frame) */
  get reference() {
    return this.ref;
  }

  /**
   * Point (base frame) the TCP should follow, or null to hand control back
   * to the task planner. The point is clamped into the reachable band.
   */
  setTeleop(goal: THREE.Vector3 | null) {
    if (goal) {
      const c = toCyl(goal);
      c.r = Math.min(R_MAX, Math.max(R_MIN, c.r));
      c.a = Math.min(ANGLE_MAX, Math.max(-ANGLE_MAX, c.a));
      c.z = HOVER_Z;
      const clamped = fromCyl(c, new THREE.Vector3());
      if (this.phase !== "teleop") {
        this.phase = "teleop";
        this.seg = null;
        // never leave a half-closed grip on nothing
        if (!this.cube.attached) this.gripperRef = GRIPPER_OPEN;
      }
      this.teleopGoal = clamped;
    } else if (this.phase === "teleop") {
      this.teleopGoal = null;
      this.startPhase(this.cube.attached ? "transport" : "approach");
    }
  }

  private move(to: Cyl, opts: { roll?: number; grip?: number; speed?: number; hold?: number } = {}) {
    const from = toCyl(this.ref);
    // unwrap angle so the sweep takes the short way round
    const da = to.a - from.a;
    const arc = Math.abs(da) * Math.max(from.r, to.r);
    const dist = Math.hypot(arc, to.r - from.r, to.z - from.z);
    const speed = opts.speed ?? 0.22; // m/s average along the path
    const duration = Math.max(opts.hold ?? 0.35, dist / speed + 0.25);
    this.seg = {
      from,
      to,
      rollFrom: this.roll,
      rollTo: opts.roll ?? this.roll,
      gripFrom: this.gripperRef,
      gripTo: opts.grip ?? this.gripperRef,
      duration,
      t: 0,
    };
  }

  /** wrist roll that lines the jaws up with a cube face at this spot */
  private rollFor(spot: Cyl, yaw: number): number {
    const q = [...this.qRef];
    const target = fromCyl({ ...spot, z: GRASP_Z }, new THREE.Vector3());
    q[4] = 0;
    solveIk(this.chain, q, { position: target, approach: DOWN, approachWeight: APPROACH_WEIGHT }, 60);
    const jaw = jawAxis(this.chain, q);
    const delta = wrapQuarter(yaw - Math.atan2(jaw.y, jaw.x));
    // the roll axis points up or down depending on pose; try both signs
    for (const sign of [1, -1]) {
      q[4] = sign * delta;
      const j = jawAxis(this.chain, q);
      if (Math.abs(wrapQuarter(yaw - Math.atan2(j.y, j.x))) < 0.05) return q[4];
    }
    return delta;
  }

  private startPhase(phase: Phase) {
    this.phase = phase;
    const hover = (c: Cyl): Cyl => ({ ...c, z: HOVER_Z });
    switch (phase) {
      case "approach":
        this.move(hover(this.pickSpot), {
          roll: this.rollFor(this.pickSpot, this.cube.yaw),
          grip: GRIPPER_OPEN,
        });
        break;
      case "descend":
        this.move({ ...this.pickSpot, z: GRASP_Z }, { speed: 0.12 });
        break;
      case "grasp":
        this.move({ ...this.pickSpot, z: GRASP_Z }, { grip: GRIPPER_CLOSED, hold: 0.45 });
        break;
      case "lift":
        this.move(hover(this.pickSpot), { speed: 0.12 });
        break;
      case "transport": {
        // carry the cube round; a small extra twist so placements vary
        const twist = (Math.random() - 0.5) * 0.8;
        this.move(hover(this.placeSpot), { roll: this.roll + twist });
        break;
      }
      case "place":
        this.move({ ...this.placeSpot, z: PLACE_Z }, { speed: 0.1 });
        break;
      case "release":
        this.move({ ...this.placeSpot, z: PLACE_Z }, { grip: GRIPPER_OPEN, hold: 0.35 });
        break;
      case "retreat":
        this.move(hover(this.placeSpot), { speed: 0.14 });
        break;
      default:
        break;
    }
  }

  private nextPhase() {
    switch (this.phase) {
      case "approach":
        return this.startPhase("descend");
      case "descend":
        return this.startPhase("grasp");
      case "grasp":
        this.attachCube();
        return this.startPhase("lift");
      case "lift":
        return this.startPhase("transport");
      case "transport":
        return this.startPhase("place");
      case "place":
        return this.startPhase("release");
      case "release":
        this.cube.attached = false;
        this.cube.vz = 0;
        // settle flat on the table, keeping only its heading
        this.cube.quaternion.setFromAxisAngle(Z_AXIS, this.cube.yaw);
        return this.startPhase("retreat");
      case "retreat":
        this.cycles += 1;
        // the cube now sits where it was placed; pick it up from there
        this.pickSpot = toCyl(this.cube.position);
        this.placeSpot = randomSpot(this.pickSpot);
        fromCyl(this.placeSpot, this.placeTarget);
        return this.startPhase("approach");
      default:
        return;
    }
  }

  private readonly tcpPose = new THREE.Matrix4();
  private readonly cubePose = new THREE.Matrix4();
  private readonly tmpScale = new THREE.Vector3();
  private readonly tmpEuler = new THREE.Euler();

  private attachCube() {
    forward(this.chain, this.q, this.tcpPose);
    this.cubePose.compose(
      this.cube.position,
      this.cube.quaternion,
      this.tmpScale.set(1, 1, 1)
    );
    this.cube.offset.copy(this.tcpPose).invert().multiply(this.cubePose);
    this.cube.attached = true;
  }

  /** advance the simulation by dt seconds */
  step(dt: number) {
    // --- reference generation ---
    if (this.phase === "teleop" && this.teleopGoal) {
      // first-order chase of the cursor, so the reference stays smooth
      const k = 1 - Math.exp(-dt / 0.12);
      this.ref.lerp(this.teleopGoal, k);
    } else if (this.seg) {
      const s = this.seg;
      s.t += dt;
      const u = minJerk(s.t / s.duration);
      fromCyl(
        {
          a: s.from.a + (s.to.a - s.from.a) * u,
          r: s.from.r + (s.to.r - s.from.r) * u,
          z: s.from.z + (s.to.z - s.from.z) * u,
        },
        this.ref
      );
      this.roll = s.rollFrom + (s.rollTo - s.rollFrom) * u;
      this.gripperRef = s.gripFrom + (s.gripTo - s.gripFrom) * u;
      if (s.t >= s.duration) this.nextPhase();
    }

    // --- IK: Cartesian reference -> joint reference ---
    this.qRef[4] = this.roll;
    solveIk(
      this.chain,
      this.qRef,
      { position: this.ref, approach: DOWN, approachWeight: APPROACH_WEIGHT },
      12
    );

    // --- servo dynamics, fixed substeps ---
    const n = Math.max(1, Math.ceil(dt / SUBSTEP));
    const h = dt / n;
    for (let s = 0; s < n; s++) {
      for (let i = 0; i < 5; i++) {
        const acc =
          SERVO_WN * SERVO_WN * (this.qRef[i] - this.q[i]) -
          2 * SERVO_ZETA * SERVO_WN * this.qd[i];
        this.qd[i] = Math.max(-SERVO_MAX_VEL, Math.min(SERVO_MAX_VEL, this.qd[i] + acc * h));
        this.q[i] += this.qd[i] * h;
      }
    }
    // the gripper servo is modelled as a simple first-order lag
    this.gripper += (this.gripperRef - this.gripper) * (1 - Math.exp(-dt / 0.06));

    // --- cube ---
    if (this.cube.attached) {
      forward(this.chain, this.q, this.tcpPose);
      this.cubePose.multiplyMatrices(this.tcpPose, this.cube.offset);
      this.cubePose.decompose(this.cube.position, this.cube.quaternion, this.tmpScale);
      this.cube.yaw = this.tmpEuler.setFromQuaternion(this.cube.quaternion, "ZYX").z;
    } else if (this.cube.position.z > CUBE_SIZE / 2) {
      this.cube.vz -= 9.81 * dt;
      this.cube.position.z = Math.max(CUBE_SIZE / 2, this.cube.position.z + this.cube.vz * dt);
    }
  }

  private readonly measured = new THREE.Vector3();

  /** TCP position from the measured (not reference) joints */
  measuredTcp(): THREE.Vector3 {
    return tcpPosition(this.chain, this.q, this.measured);
  }

  telemetry(): Telemetry {
    this.measuredTcp();
    return {
      phase: this.phase,
      jointsDeg: this.q.map((v) => (v * 180) / Math.PI),
      trackingErrorMm: this.measured.distanceTo(this.ref) * 1000,
      cycles: this.cycles,
    };
  }
}
