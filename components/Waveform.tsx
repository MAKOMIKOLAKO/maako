const PATHS: Record<string, string> = {
  bio: "0,16 6,4 10,27 14,9 18,21 24,5 28,25 34,11 38,19 44,4 48,23 54,9 58,17 64,7 70,25 76,13 82,21 88,5 94,19 100,11 106,23 112,9 118,16",
  control: "0,22 18,22 18,8 46,8 46,22 74,22 74,8 102,8 102,22 120,22",
  reward: "0,28 10,26 20,27 30,22 40,24 50,18 60,20 70,14 80,16 90,10 100,12 110,6 118,8",
  flat: "0,16 120,16",
};

export default function Waveform({
  variant,
  className = "",
}: {
  variant: "bio" | "control" | "reward" | "flat";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 32"
      className={`h-8 w-full text-accent ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={PATHS[variant]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
