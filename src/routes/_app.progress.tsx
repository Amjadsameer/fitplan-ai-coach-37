import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, TrendingDown, Target, Scale, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "@/lib/i18n";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
});

interface Entry { date: string; weight: number; }

function ProgressPage() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [entries, setEntries] = useState<Entry[]>([
    { date: "Jun 02", weight: 84.2 },
    { date: "Jun 09", weight: 83.1 },
    { date: "Jun 16", weight: 82.0 },
    { date: "Jun 23", weight: 81.3 },
    { date: "Jun 30", weight: 80.1 },
    { date: "Jul 07", weight: 79.2 },
    { date: "Jul 14", weight: 78.4 },
  ]);

  const start = entries[0].weight;
  const current = entries[entries.length - 1].weight;
  const goal = 74.0;
  const lost = (start - current).toFixed(1);

  const add = () => {
    const v = parseFloat(newWeight);
    if (!isNaN(v)) {
      setEntries([...entries, { date: new Date().toLocaleDateString("en", { month: "short", day: "2-digit" }), weight: v }]);
      setNewWeight("");
      setOpen(false);
    }
  };

  return (
    <div className="space-y-5 px-5 pb-8 pt-12 animate-fade-in-up">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.progress}</p>
          <h1 className="truncate text-2xl font-extrabold">{t.weightTracking}</h1>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="tap inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" /> {t.addWeight}
        </button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <Stat icon={<Scale className="h-4 w-4" />} label={t.startWeight} value={`${start}`} />
        <Stat icon={<TrendingDown className="h-4 w-4" />} label={t.currentW} value={`${current}`} highlight />
        <Stat icon={<Target className="h-4 w-4" />} label={t.goalW} value={`${goal}`} />
      </section>

      {/* Chart */}
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">{t.weightTracking}</h2>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success tabular-nums">−{lost} {t.kg}</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={entries} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "var(--color-muted-foreground)" }}
              />
              <Area type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#wt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* History */}
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-bold">{t.weightHistory}</h2>
        <ul className="space-y-1.5">
          {[...entries].reverse().map((e, i) => {
            const prev = [...entries].reverse()[i + 1];
            const diff = prev ? (e.weight - prev.weight).toFixed(1) : null;
            return (
              <li key={i} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                <span className="text-sm font-medium">{e.date}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums">{e.weight} {t.kg}</span>
                  {diff && (
                    <span className={`w-12 text-end text-xs font-semibold tabular-nums ${parseFloat(diff) < 0 ? "text-success" : "text-warning"}`}>
                      {parseFloat(diff) > 0 ? "+" : ""}{diff}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Add modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 backdrop-blur-sm sm:place-items-center" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-card animate-fade-in-up sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{t.addWeight}</h3>
              <button onClick={() => setOpen(false)} className="tap grid h-9 w-9 place-items-center rounded-xl bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground">{t.enterWeight} ({t.kg})</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                autoFocus
                placeholder="78.4"
                className="mt-1.5 w-full rounded-2xl border border-border bg-input/40 px-4 py-3.5 text-lg font-bold tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button onClick={add} className="tap mt-4 w-full rounded-2xl bg-gradient-primary py-4 font-semibold text-primary-foreground shadow-glow">
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  const { t } = useApp();
  return (
    <div className={`rounded-2xl border p-3 shadow-soft ${highlight ? "border-primary/40 bg-gradient-card" : "border-border bg-card"}`}>
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-extrabold tabular-nums">{value}<span className="text-xs font-medium text-muted-foreground"> {t.kg}</span></p>
    </div>
  );
}
