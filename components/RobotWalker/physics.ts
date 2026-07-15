export const STRIDE_SECONDS = 1.9;
export const WALK_SPEED_THRESHOLD = 0.04; // world units/sec
export const FOLLOW_MIN_DISTANCE = 1.4;
export const FOLLOW_EASE_RATE = 0.9; // higher = catches up faster

export const HIP_AMPLITUDE = 0.5; // radians
export const KNEE_AMPLITUDE = 0.95; // radians
export const BOB_AMPLITUDE = 0.02; // world units

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type LegAngles = { hip: number; knee: number };

/**
 * legPhase in [0, 0.5) = swing (hip forward, knee lifts and clamps >= 0).
 * legPhase in [0.5, 1) = stance (hip drags back, knee locked straight).
 */
export function legAngles(globalPhase: number, offset: number): LegAngles {
  const legPhase = (((globalPhase + offset) % 1) + 1) % 1;
  const swing = legPhase < 0.5;
  const local = swing ? legPhase / 0.5 : (legPhase - 0.5) / 0.5;
  const eased = easeInOutCubic(local);

  if (swing) {
    return {
      hip: HIP_AMPLITUDE * Math.sin(Math.PI * eased),
      knee: Math.max(0, KNEE_AMPLITUDE * Math.sin(Math.PI * eased)),
    };
  }
  return {
    hip: -HIP_AMPLITUDE * Math.sin(Math.PI * eased),
    knee: 0,
  };
}

export function bobOffset(globalPhase: number) {
  return BOB_AMPLITUDE * Math.abs(Math.sin(2 * Math.PI * globalPhase * 2));
}
