import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/i18n";

export const Route = createFileRoute("/_app/plan")({
  component: PlanPage,
});

interface MealItem { name: string; qty: string; }
interface Meal {
  id: string;
  type: string;
  time: string;
  kcal: number;
  p: number; c: number; f: number;
  items: MealItem[];
}

function PlanPage() {
  const { t } = useApp();
  const [completed, setCompleted] = useState<Record<string, boolean>>({ breakfast: true });

  const meals: Meal[] = [
    { id: "breakfast", type: t.breakfast, time: "08:00", kcal: 420, p: 28, c: 52, f: 12,
      items: [{ name: t.meals.oatmeal, qty: "80g" }, { name: t.meals.greekYogurt, qty: "150g" }] },
    { id: "lunch", type: t.lunch, time: "13:00", kcal: 650, p: 48, c: 70, f: 18,
      items: [{ name: t.meals.chicken, qty: "180g" }, { name: "Mixed salad", qty: "200g" }] },
    { id: "dinner", type: t.dinner, time: "19:30", kcal: 580, p: 42, c: 55, f: 20,
      items: [{ name: t.meals.salmon, qty: "200g" }, { name: "Sweet potato", qty: "150g" }] },
    { id: "snacks", type: t.snacks, time: "16:00", kcal: 220, p: 14, c: 22, f: 8,
      items: [{ name: t.meals.greekYogurt, qty: "120g" }] },
  ];

  const total = meals.reduce((a, m) => a + m.kcal, 0);

  return (
    <div className="space-y-5 px-5 pb-8 pt-12 animate-fade-in-up">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.nutritionPlan}</p>
        <h1 className="text-2xl font-extrabold">{t.myPlan}</h1>
      </header>

      <div className="rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
        <p className="text-xs uppercase tracking-wider opacity-80">{t.dailyTarget}</p>
        <p className="font-display text-4xl font-extrabold">{total} <span className="text-base opacity-80">kcal</span></p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/15 py-2 backdrop-blur">
            <p className="text-[10px] opacity-80">{t.protein}</p>
            <p className="text-sm font-bold tabular-nums">132g</p>
          </div>
          <div className="rounded-xl bg-white/15 py-2 backdrop-blur">
            <p className="text-[10px] opacity-80">{t.carbs}</p>
            <p className="text-sm font-bold tabular-nums">199g</p>
          </div>
          <div className="rounded-xl bg-white/15 py-2 backdrop-blur">
            <p className="text-[10px] opacity-80">{t.fat}</p>
            <p className="text-sm font-bold tabular-nums">58g</p>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {meals.map(m => {
          const done = completed[m.id];
          return (
            <li key={m.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${done ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {done ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-bold">{m.type}</h3>
                      <span className="text-xs text-muted-foreground tabular-nums">{m.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground tabular-nums">{m.kcal}</span> kcal · P{m.p} · C{m.c} · F{m.f}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" />
                </summary>
                <div className="space-y-3 border-t border-border bg-muted/30 px-4 pb-4 pt-3">
                  <ul className="space-y-2">
                    {m.items.map(it => (
                      <li key={it.name} className="flex items-center justify-between rounded-xl bg-card px-3 py-2.5">
                        <span className="text-sm font-medium">{it.name}</span>
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">{it.qty}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setCompleted(s => ({ ...s, [m.id]: !s[m.id] }))}
                    className={`tap w-full rounded-2xl py-3 text-sm font-semibold transition-all ${done ? "bg-success/15 text-success" : "bg-gradient-primary text-primary-foreground shadow-glow"}`}
                  >
                    {done ? `✓ ${t.completed}` : t.markCompleted}
                  </button>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
