"use client";

interface ProgressOverlayProps {
  visible: boolean;
  progress: number;
  text: string;
}

export default function ProgressOverlay({
  visible,
  progress,
  text,
}: ProgressOverlayProps) {
  if (!visible) return null;

  const offset = 283 - (283 * progress) / 100;

  return (
    <div className="absolute inset-0 bg-[rgba(10,12,15,0.95)] flex flex-col items-center justify-center z-20">
      <svg className="w-[120px] h-[120px]" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={offset}
          className="transition-all duration-500"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="mt-4 text-[var(--text-secondary)]">{text}</div>
    </div>
  );
}
