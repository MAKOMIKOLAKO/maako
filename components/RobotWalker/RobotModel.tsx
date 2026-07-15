import { RefObject } from "react";
import * as THREE from "three";

const THIGH_LEN = 0.22;
const CALF_LEN = 0.18;
const FOOT_LEN = 0.09;
const FOOT_H = 0.03;
export const HIP_Y = FOOT_H + CALF_LEN + THIGH_LEN;
const TORSO_H = 0.28;
const TORSO_W = 0.26;
const TORSO_D = 0.22;
const HEAD_SIZE = 0.14;
const HIP_X = TORSO_W / 2 - 0.045;

const CHASSIS_COLOR = "#6b6960";
const JOINT_COLOR = "#232019";
const ACCENT_COLOR = "#3e6e96";

type GroupRef = RefObject<THREE.Group | null>;

function Leg({
  signX,
  hipRef,
  kneeRef,
}: {
  signX: 1 | -1;
  hipRef: GroupRef;
  kneeRef: GroupRef;
}) {
  return (
    <group ref={hipRef} position={[signX * HIP_X, HIP_Y, 0]}>
      <mesh>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshStandardMaterial
          color={JOINT_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, -THIGH_LEN / 2, 0]}>
        <boxGeometry args={[0.075, THIGH_LEN, 0.075]} />
        <meshStandardMaterial
          color={CHASSIS_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <group ref={kneeRef} position={[0, -THIGH_LEN, 0]}>
        <mesh>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial
            color={JOINT_COLOR}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, -CALF_LEN / 2, 0]}>
          <boxGeometry args={[0.06, CALF_LEN, 0.06]} />
          <meshStandardMaterial
            color={CHASSIS_COLOR}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, -CALF_LEN - FOOT_H / 2, FOOT_LEN * 0.2]}>
          <boxGeometry args={[0.075, FOOT_H, FOOT_LEN]} />
          <meshStandardMaterial
            color={JOINT_COLOR}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function RobotModel({
  bobRef,
  leftHipRef,
  leftKneeRef,
  rightHipRef,
  rightKneeRef,
}: {
  bobRef: GroupRef;
  leftHipRef: GroupRef;
  leftKneeRef: GroupRef;
  rightHipRef: GroupRef;
  rightKneeRef: GroupRef;
}) {
  return (
    <group ref={bobRef}>
      <mesh position={[0, HIP_Y + TORSO_H / 2, 0]}>
        <boxGeometry args={[TORSO_W, TORSO_H, TORSO_D]} />
        <meshStandardMaterial
          color={CHASSIS_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[TORSO_W / 2 + 0.025, HIP_Y + TORSO_H - 0.045, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.06]} />
        <meshStandardMaterial
          color={JOINT_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[-(TORSO_W / 2 + 0.025), HIP_Y + TORSO_H - 0.045, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.06]} />
        <meshStandardMaterial
          color={JOINT_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, HIP_Y + TORSO_H + HEAD_SIZE / 2 + 0.02, 0]}>
        <boxGeometry args={[HEAD_SIZE, HEAD_SIZE, HEAD_SIZE]} />
        <meshStandardMaterial
          color={CHASSIS_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh
        position={[
          0,
          HIP_Y + TORSO_H + HEAD_SIZE / 2 + 0.02,
          HEAD_SIZE / 2 + 0.002,
        ]}
      >
        <boxGeometry args={[HEAD_SIZE * 0.7, HEAD_SIZE * 0.22, 0.01]} />
        <meshStandardMaterial
          color={ACCENT_COLOR}
          emissive={ACCENT_COLOR}
          emissiveIntensity={0.4}
          roughness={0.6}
        />
      </mesh>

      <Leg signX={-1} hipRef={leftHipRef} kneeRef={leftKneeRef} />
      <Leg signX={1} hipRef={rightHipRef} kneeRef={rightKneeRef} />
    </group>
  );
}
