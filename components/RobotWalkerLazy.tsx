"use client";

import dynamic from "next/dynamic";

const RobotWalker = dynamic(() => import("@/components/RobotWalker"), {
  ssr: false,
});

export default function RobotWalkerLazy() {
  return <RobotWalker />;
}
