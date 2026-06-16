import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Clock, Heart, Repeat2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/i18n";

export const Route = createFileRoute("/_app/plan")({
  component: PlanPage,
});

interface MealItem { name: string; qty: string; }
interface MealVariant {
  kcal: number;
  p: number; c: number; f: number;
  items: MealItem[];
}
interface Meal {
  id: string;
  type: string;
  time: string;
  variants: MealVariant[];
}

function PlanPage() {
  const { t } = useApp();
  const [completed, setCompleted] = useState<Record<string, boolean>>({ breakfast: true });
  const [variantIdx, setVariantIdx] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const f = localStorage.getItem("fp_favorites");
    if (f) try { setFavorites(JSON.parse(f)); } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("fp_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const meals: Meal[] = useMemo(() => [
    { id: "breakfast", type: t.breakfast, time: "08:00", variants: [
      { kcal: 420, p: 28, c: 52, f: 12, items: [{ name: t.meals.oatmeal, qty: "80g" }, { name: t.meals.greekYogurt, qty: "150g" }] },
      { kcal: 410, p: 30, c: 38, f: 16, items: [{ name: t.meals.eggs, qty: "3 eggs" }, { name: "Avocado toast", qty: "1 slice" }] },
    ]},
    { id: "lunch", type: t.lunch, time: "13:00", variants: [
      { kcal: 650, p: 48, c: 70, f: 18, items: [{ name: t.meals.chicken, qty: "180g" }, { name: "Mixed salad", qty: "200g" }] },
      { kcal: 640, p: 50, c: 65, f: 20, items: [{ name: "Beef & rice bowl", qty: "180g" }, { name: "Steamed veg", qty: "200g" }] },
    ]},
    { id: "dinner", type: t.dinner, time: "19:30", variants: [
      { kcal: 580, p: 42, c: 55, f: 20, items: [{ name: t.meals.salmon, qty: "200g" }, { name: "Sweet potato", qty: "150g" }] },
      { kcal: 570, p: 44, c: 50, f: 22, items: [{ name: "Tuna pasta", qty: "200g" }, { name: "Green beans", qty: "150g" }] },
    ]},
    { id: "snacks", type: t.snacks, time: "16:00", variants: [
      { kcal: 220, p: 14, c: 22, f: 8, items: [{ name: t.meals.greekYogurt, qty: "120g" }] },
      { kcal: 210, p: 12, c: 25, f: 7, items: [{ name: "Protein shake", qty: "1 scoop" }, { name: "Banana", qty: "1" }] },
    ]},
  ], [t]);

  const getVariant = (m: Meal) => m.variants[(variantIdx[m.id] ?? 0) % m.variants.length];
  const total = meals.reduce((a, m) => a + getVariant(m).kcal, 0);

  const swapMeal = (m: Meal) => {
    setVariantIdx(s => ({ ...s, [m.id]: ((s[m.id] ?? 0) + 1) % m.variants.length }));
    setToast(t.swapped);
    setTimeout(() => setToast(null), 1500);
  };

  const toggleFav = (name: string) => {
    setFavorites(f => f.includes(name) ? f.filter(x => x !== name) : [...f, name]);
  };

  return (
    <div className="space-y-5 px-5 pb-8 pt-12 animate-fade-in-up">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.nutritionPlan}</p>
          <h1 className="truncate text-2xl font-extrabold">{t.myPlan}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-soft">
          <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" />
          <span className="tabular-nums">{favorites.length}</span>
          <span className="text-muted-foreground">{t.favorites}</span>
        </div>
      </header>

      <div className="rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
        <p className="text-xs uppercase tracking-wider opacity-80">{t.dailyTarget}</p>
        <p className="font-display text-4xl font-extrabold tabular-nums">{total} <span className="text-base opacity-80">kcal</span></p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { l: t.protein, v: meals.reduce((a,m)=>a+getVariant(m).p,0) },
            { l: t.carbs, v: meals.reduce((a,m)=>a+getVariant(m).c,0) },
            { l: t.fat, v: meals.reduce((a,m)=>a+getVariant(m).f,0) },
          ].map(x => (
            <div key={x.l} className="rounded-xl bg-white/15 py-2 backdrop-blur">
              <p className="text-[10px] opacity-80">{x.l}</p>
              <p className="text-sm font-bold tabular-nums">{x.v}g</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-3">
        {meals.map(m => {
          const done = completed[m.id];
          const v = getVariant(m);
          const altCount = m.variants.length;
          const currentIdx = (variantIdx[m.id] ?? 0) % altCount;
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
                      <span className="font-semibold text-foreground tabular-nums">{v.kcal}</span> kcal · P{v.p} · C{v.c} · F{v.f}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" />
                </summary>
                <div className="space-y-3 border-t border-border bg-muted/30 px-4 pb-4 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Sparkles className="h-3 w-3" /> {t.alternatives}
                    </span>
                    <div className="flex gap-1">
                      {m.variants.map((_, i) => (
                        <span key={i} className={`h-1.5 w-4 rounded-full ${i === currentIdx ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {v.items.map(it => {
                      const fav = favorites.includes(it.name);
                      return (
                        <li key={it.name} className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2.5">
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{it.name}</span>
                          <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">{it.qty}</span>
                          <button
                            onClick={(e) => { e.preventDefault(); toggleFav(it.name); }}
                            aria-label={fav ? t.removeFromFavorites : t.addToFavorites}
                            className="tap grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                          >
                            <Heart className={`h-4 w-4 transition-all ${fav ? "fill-destructive text-destructive scale-110" : "text-muted-foreground"}`} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.preventDefault(); swapMeal(m); }}
                      className="tap inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold"
                    >
                      <Repeat2 className="h-4 w-4" /> {t.swap}
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setCompleted(s => ({ ...s, [m.id]: !s[m.id] })); }}
                      className={`tap flex-1 rounded-2xl py-3 text-sm font-semibold transition-all ${done ? "bg-success/15 text-success" : "bg-gradient-primary text-primary-foreground shadow-glow"}`}
                    >
                      {done ? `✓ ${t.completed}` : t.markCompleted}
                    </button>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      {toast && (
        <div className="pointer-events-none fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-card animate-fade-in-up">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
