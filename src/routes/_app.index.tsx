import { createFileRoute } from "@tanstack/react-router";
import { Bell, Droplets, Flame } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import { useApp } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useApp();
  const { email } = useAuth();
  const name = (email?.split("@")[0] ?? "Athlete").replace(/^\w/, c => c.toUpperCase());

  const [water, setWater] = useState(5);
  const waterMax = 8;
  const caloriesEaten = 1420;
  const caloriesTarget = 2200;

  const meals = [
    { name: t.breakfast, done: true, kcal: 420 },
    { name: t.lunch, done: true, kcal: 650 },
    { name: t.dinner, done: false, kcal: 580 },
    { name: t.snacks, done: false, kcal: 220 },
  ];
  const doneCount = meals.filter(m => m.done).length;

  return (
    <div className="space-y-5 px-5 pb-8 pt-12 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.welcomeBack}</p>
          <h1 className="text-2xl font-extrabold">{name} 👋</h1>
        </div>
        <button className="tap relative grid h-11 w-11 place-items-center rounded-2xl border border-border bg-card shadow-soft">
          <Bell className="h-5 w-5" />
          <span className="absolute end-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
      </header>

      {/* Hero calories card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <ProgressRing
            value={caloriesEaten}
            max={caloriesTarget}
            size={120}
            stroke={11}
            color="white"
            trackColor="rgba(255,255,255,0.2)"
          >
            <div>
              <p className="text-2xl font-extrabold tabular-nums">{caloriesEaten}</p>
              <p className="text-[10px] uppercase tracking-wide opacity-80">/ {caloriesTarget}</p>
            </div>
          </ProgressRing>
          <div className="flex-1 space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              <Flame className="h-3 w-3" /> {t.dailyTarget}
            </div>
            <p className="text-sm font-medium opacity-90">{t.currentWeight}</p>
            <p className="font-display text-3xl font-extrabold">78.4 <span className="text-sm font-medium opacity-80">{t.kg}</span></p>
          </div>
        </div>
      </section>

      {/* Macros */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: t.protein, val: 98, max: 165, color: "var(--color-primary)" },
          { label: t.carbs, val: 180, max: 245, color: "var(--color-secondary)" },
          { label: t.fat, val: 42, max: 73, color: "var(--color-warning)" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <p className="mt-1 font-display text-xl font-extrabold tabular-nums">{m.val}<span className="text-xs text-muted-foreground">g</span></p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${(m.val/m.max)*100}%`, backgroundColor: m.color }} />
            </div>
          </div>
        ))}
      </section>

      {/* Today's meals */}
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">{t.todaysMeals}</h2>
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">{doneCount}/{meals.length}</span>
        </div>
        <MacroBar label={t.completed} value={doneCount} max={meals.length} unit="" color="var(--color-primary)" />
        <ul className="space-y-2 pt-1">
          {meals.map(m => (
            <li key={m.name} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${m.done ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <span className={`text-sm font-medium ${m.done ? "" : "text-muted-foreground"}`}>{m.name}</span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">{m.kcal} kcal</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Water */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-info/15 text-info">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{t.waterIntake}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{water}/{waterMax} {t.glasses}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          {Array.from({ length: waterMax }).map((_, i) => (
            <button
              key={i}
              onClick={() => setWater(i + 1 === water ? i : i + 1)}
              className={`tap h-10 flex-1 rounded-xl border transition-all ${i < water ? "border-info bg-info/20" : "border-border bg-muted/30"}`}
              aria-label={`${t.glasses} ${i+1}`}
            >
              <Droplets className={`mx-auto h-4 w-4 ${i < water ? "text-info" : "text-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">{lang === "ar" ? "استمر، أنت على المسار الصحيح" : "Keep going — you're on track 🔥"}</p>
    </div>
  );
}
