// leg segment lengths (world units) — kept in sync with RobotModel's mesh
// dimensions. thigh:calf ratio held at 220:180 per spec, scaled down so
// the whole leg reads stocky (< half of total standing height).
export const THIGH_LEN = 0.165;
export const CALF_LEN = 0.135;
export const LEG_LEN = THIGH_LEN + CALF_LEN;
export const FOOT_H = 0.025;
// hip-pivot-to-sole distance when the leg hangs straight — the single
// length used consistently for both the swing/stance angle trig and the
// hip-height solve, so the sole (not just the calf's end) lands at y=0.
export const FULL_LEG = LEG_LEN + FOOT_H;

export const MOVE_SPEED = 0.35; // world units/sec, constant while walking
export const STRIDE_SECONDS = 1.9; // full gait cycle duration while walking
export const ARRIVE_RADIUS = 0.4; // stop/idle once within this of the target
export const TARGET_REEVAL_MS = 700; // how often a moving cursor target is resampled

export const KNEE_AMPLITUDE = 0.95; // radians, swing-phase lift only

// distance the swinging foot must cover (hip-relative, fore-aft) so that,
// over one full stride, the stance-phase foot exactly cancels out the
// body's constant-speed translation instead of sliding.
export const STRIDE_HALF = (MOVE_SPEED * STRIDE_SECONDS) / 4;

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type LegPose = {
  hip: number;
  knee: number;
  /** hip-relative fore-aft offset of the foot, world units */
  relZ: number;
  planted: boolean;
};

/**
 * legPhase in [0, 0.5) = swing: foot arcs from trailing (-STRIDE_HALF) to
 * leading (+STRIDE_HALF), knee lifts and clamps >= 0.
 * legPhase in [0.5, 1) = stance: foot is planted: its relZ is driven purely
 * by how far the body has advanced since footstrike, so a caller integrating
 * position at MOVE_SPEED will see the planted foot hold its ground-plane
 * position exactly (no sliding), rather than being re-derived from phase
 * alone (which would only match the ground if speed is constant).
 */
export function legPose(globalPhase: number, offset: number): LegPose {
  const legPhase = (((globalPhase + offset) % 1) + 1) % 1;
  const swing = legPhase < 0.5;
  const local = swing ? legPhase / 0.5 : (legPhase - 0.5) / 0.5;
  const eased = easeInOutCubic(local);

  if (swing) {
    const relZ = -STRIDE_HALF + 2 * STRIDE_HALF * eased;
    return {
      relZ,
      hip: Math.asin(clamp(relZ / FULL_LEG, -1, 1)),
      knee: Math.max(0, KNEE_AMPLITUDE * Math.sin(Math.PI * eased)),
      planted: false,
    };
  }
  const relZ = STRIDE_HALF - 2 * STRIDE_HALF * eased;
  return {
    relZ,
    hip: Math.asin(clamp(relZ / FULL_LEG, -1, 1)),
    knee: 0,
    planted: true,
  };
}

export function hipHeightForStance(relZ: number) {
  return Math.sqrt(Math.max(0, FULL_LEG * FULL_LEG - relZ * relZ));
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
