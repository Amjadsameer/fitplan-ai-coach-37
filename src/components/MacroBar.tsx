interface BarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  unit?: string;
}
export function MacroBar({ label, value, max, color = "var(--color-primary)", unit = "g" }: BarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}/{max}{unit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
