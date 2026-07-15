import { RefObject } from "react";
import * as THREE from "three";
import { THIGH_LEN, CALF_LEN, FOOT_H } from "./physics";

const FOOT_LEN = 0.075;
const TORSO_H = 0.36;
const TORSO_W = 0.3;
const TORSO_D = 0.26;
const HEAD_SIZE = 0.15;
const HIP_X = TORSO_W / 2 - 0.05;

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
    <group ref={hipRef} position={[signX * HIP_X, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshStandardMaterial
          color={JOINT_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, -THIGH_LEN / 2, 0]}>
        <boxGeometry args={[0.07, THIGH_LEN, 0.07]} />
        <meshStandardMaterial
          color={CHASSIS_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <group ref={kneeRef} position={[0, -THIGH_LEN, 0]}>
        <mesh>
          <sphereGeometry args={[0.038, 8, 6]} />
          <meshStandardMaterial
            color={JOINT_COLOR}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, -CALF_LEN / 2, 0]}>
          <boxGeometry args={[0.056, CALF_LEN, 0.056]} />
          <meshStandardMaterial
            color={CHASSIS_COLOR}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, -CALF_LEN - FOOT_H / 2, FOOT_LEN * 0.22]}>
          <boxGeometry args={[0.07, FOOT_H, FOOT_LEN]} />
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
      <mesh position={[0, TORSO_H / 2, 0]}>
        <boxGeometry args={[TORSO_W, TORSO_H, TORSO_D]} />
        <meshStandardMaterial
          color={CHASSIS_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[TORSO_W / 2 + 0.025, TORSO_H - 0.05, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.06]} />
        <meshStandardMaterial
          color={JOINT_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[-(TORSO_W / 2 + 0.025), TORSO_H - 0.05, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.06]} />
        <meshStandardMaterial
          color={JOINT_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, TORSO_H + HEAD_SIZE / 2 + 0.02, 0]}>
        <boxGeometry args={[HEAD_SIZE, HEAD_SIZE, HEAD_SIZE]} />
        <meshStandardMaterial
          color={CHASSIS_COLOR}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh
        position={[0, TORSO_H + HEAD_SIZE / 2 + 0.02, HEAD_SIZE / 2 + 0.002]}
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
