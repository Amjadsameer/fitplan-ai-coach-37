import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ArrowRight, Ruler, Scale, Target, User as UserIcon } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { DEFAULT_PROFILE, saveProfile, type Activity as ActivityLevel, type Sex, type UserProfile } from "@/lib/profile";
import { markOnboarded } from "@/lib/onboarding";

export const Route = createFileRoute("/_app/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { t, lang } = useApp();
  const { user, email } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState((email?.split("@")[0] ?? "").replace(/^\w/, c => c.toUpperCase()));
  const [p, setP] = useState<UserProfile>(DEFAULT_PROFILE);
  const isAr = lang === "ar";

  const steps = [
    isAr ? "الاسم" : "Name",
    isAr ? "الجنس" : "Sex",
    isAr ? "العمر" : "Age",
    isAr ? "الطول والوزن" : "Height & Weight",
    isAr ? "النشاط" : "Activity",
  ];

  const canNext =
    (step === 0 && name.trim().length > 1) ||
    (step === 1 && !!p.sex) ||
    (step === 2 && p.age > 5 && p.age < 120) ||
    (step === 3 && p.height > 80 && p.weight > 20) ||
    step === 4;

  const finish = () => {
    saveProfile(p);
    if (typeof window !== "undefined" && name) localStorage.setItem("fp_name", name);
    if (user?.id) markOnboarded(user.id);
    navigate({ to: "/" });
  };

  const next = () => (step < steps.length - 1 ? setStep(step + 1) : finish());

  return (
    <div className="min-h-screen bg-background px-5 pb-10 pt-14 animate-fade-in-up">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isAr ? "خطوة" : "Step"} {step + 1} / {steps.length}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold">
          {isAr ? "لنتعرّف عليك" : "Let's set you up"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAr ? "نحتاج بعض المعلومات الأساسية لحساب خطتك." : "We need a few basics to build your plan."}
        </p>
        <div className="mt-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-gradient-primary" : "bg-muted"}`} />
          ))}
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        {step === 0 && (
          <Field icon={<UserIcon className="h-4 w-4" />} label={isAr ? "اسمك" : "Your name"}>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "مثال: أحمد" : "e.g. Alex"}
              className="w-full bg-transparent font-display text-xl font-bold outline-none placeholder:text-muted-foreground/50"
            />
          </Field>
        )}

        {step === 1 && (
          <Field icon={<UserIcon className="h-4 w-4" />} label={isAr ? "الجنس" : "Sex"}>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["male", "female"] as Sex[]).map(s => (
                <button
                  key={s}
                  onClick={() => setP({ ...p, sex: s })}
                  className={`tap rounded-2xl py-4 text-sm font-bold ${p.sex === s ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}
                >
                  {s === "male" ? t.male : t.female}
                </button>
              ))}
            </div>
          </Field>
        )}

        {step === 2 && (
          <Field icon={<Target className="h-4 w-4" />} label={t.age}>
            <div className="flex items-baseline gap-2">
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                value={p.age}
                onChange={(e) => { const n = parseInt(e.target.value); if (!isNaN(n)) setP({ ...p, age: n }); }}
                className="w-full bg-transparent font-display text-3xl font-extrabold tabular-nums outline-none"
              />
              <span className="text-sm text-muted-foreground">{isAr ? "سنة" : "yrs"}</span>
            </div>
          </Field>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3">
            <Field icon={<Ruler className="h-4 w-4" />} label={t.height}>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={p.height}
                  onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setP({ ...p, height: n }); }}
                  className="w-full bg-transparent font-display text-2xl font-bold tabular-nums outline-none"
                />
                <span className="text-xs text-muted-foreground">cm</span>
              </div>
            </Field>
            <Field icon={<Scale className="h-4 w-4" />} label={t.weight}>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={p.weight}
                  onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setP({ ...p, weight: n }); }}
                  className="w-full bg-transparent font-display text-2xl font-bold tabular-nums outline-none"
                />
                <span className="text-xs text-muted-foreground">{t.kg}</span>
              </div>
            </Field>
          </div>
        )}

        {step === 4 && (
          <Field icon={<Activity className="h-4 w-4" />} label={t.activityLevel}>
            <div className="mt-2 grid gap-2">
              {([
                { v: "sedentary", l: t.sedentary },
                { v: "light", l: t.activityLight },
                { v: "moderate", l: t.activityModerate },
                { v: "active", l: t.activityActive },
                { v: "very_active", l: t.veryActive },
              ] as { v: ActivityLevel; l: string }[]).map(o => (
                <button
                  key={o.v}
                  onClick={() => setP({ ...p, activity: o.v })}
                  className={`tap rounded-2xl px-4 py-3 text-start text-sm font-bold ${p.activity === o.v ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </Field>
        )}
      </section>

      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="tap rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold"
          >
            {isAr ? "رجوع" : "Back"}
          </button>
        )}
        <button
          disabled={!canNext}
          onClick={next}
          className="tap flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
        >
          {step === steps.length - 1 ? (isAr ? "ابدأ" : "Get started") : (isAr ? "التالي" : "Next")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">{icon}</div>
        {label}
      </div>
      {children}
    </div>
  );
}
