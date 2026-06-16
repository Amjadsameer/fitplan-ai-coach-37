import { useEffect, useState, type ReactNode } from "react";

interface RingProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}

export function ProgressRing({
  value, max, size = 120, stroke = 10,
  color = "var(--color-primary)",
  trackColor = "var(--color-muted)",
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(c - pct * c));
    return () => cancelAnimationFrame(id);
  }, [c, pct]);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
