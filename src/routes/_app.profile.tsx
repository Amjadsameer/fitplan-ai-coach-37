import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Bell, Droplets, Globe, LogOut, Moon, Ruler, Scale, Sun, Target, User as UserIcon, Utensils } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { tdee, useProfile, type Activity as ActivityLevel, type Sex } from "@/lib/profile";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useProfile();
  const name = (email?.split("@")[0] ?? "Athlete").replace(/^\w/, c => c.toUpperCase());

  const update = <K extends keyof typeof profile>(k: K, v: (typeof profile)[K]) =>
    setProfile({ ...profile, [k]: v });

  return (
    <div className="space-y-5 px-5 pb-8 pt-12 animate-fade-in-up">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.profile}</p>
        <h1 className="text-2xl font-extrabold">{t.personalInfo}</h1>
      </header>

      <section className="flex items-center gap-4 rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <UserIcon className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold">{name}</p>
          <p className="truncate text-xs opacity-90">{email ?? "athlete@fitplan.ai"}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">Premium</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tabular-nums backdrop-blur">{tdee(profile)} kcal/day</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <NumField icon={<Ruler className="h-4 w-4" />} label={t.height} value={profile.height} unit="cm" onChange={v => update("height", v)} />
        <NumField icon={<Scale className="h-4 w-4" />} label={t.weight} value={profile.weight} unit={t.kg} onChange={v => update("weight", v)} step={0.1} />
        <NumField icon={<Target className="h-4 w-4" />} label={t.age} value={profile.age} unit="" onChange={v => update("age", Math.round(v))} />
        <SelectField
          icon={<UserIcon className="h-4 w-4" />}
          label={t.sex}
          value={profile.sex}
          options={[{ v: "male", l: t.male }, { v: "female", l: t.female }]}
          onChange={v => update("sex", v as Sex)}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> {t.activityLevel}
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {([
            { v: "sedentary", l: t.sedentary },
            { v: "light", l: t.activityLight },
            { v: "moderate", l: t.activityModerate },
            { v: "active", l: t.activityActive },
            { v: "very_active", l: t.veryActive },
          ] as { v: ActivityLevel; l: string }[]).map(o => (
            <button
              key={o.v}
              onClick={() => update("activity", o.v)}
              className={`tap rounded-xl py-2 text-[10px] font-bold transition-all ${profile.activity === o.v ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <Row icon={<Globe className="h-4 w-4" />} label={t.language}>
          <div className="flex gap-1 rounded-full bg-muted p-0.5">
            <button onClick={() => setLang("en")} className={`tap rounded-full px-3 py-1 text-xs font-semibold ${lang === "en" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>EN</button>
            <button onClick={() => setLang("ar")} className={`tap rounded-full px-3 py-1 text-xs font-semibold ${lang === "ar" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>AR</button>
          </div>
        </Row>
        <Divider />
        <Row icon={theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} label={t.theme}>
          <button onClick={toggleTheme} className="tap rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
            {theme === "dark" ? t.dark : t.light}
          </button>
        </Row>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="flex items-center gap-2 px-4 pt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Bell className="h-3.5 w-3.5" /> {t.notifications}
        </div>
        <Row icon={<Utensils className="h-4 w-4" />} label={t.mealReminders}><Toggle defaultOn /></Row>
        <Divider />
        <Row icon={<Droplets className="h-4 w-4" />} label={t.waterReminders}><Toggle defaultOn /></Row>
      </section>

      <button
        onClick={() => { logout(); navigate({ to: "/login" }); }}
        className="tap flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-4 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4 rtl:rotate-180" /> {t.logout}
      </button>
    </div>
  );
}

function NumField({ icon, label, value, unit, onChange, step = 1 }: { icon: React.ReactNode; label: string; value: number; unit: string; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">{icon}</div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n) && n > 0) onChange(n); }}
          className="w-full bg-transparent font-display text-lg font-bold tabular-nums outline-none"
        />
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function SelectField({ icon, label, value, options, onChange }: { icon: React.ReactNode; label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">{icon}</div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <div className="mt-2 flex gap-1.5">
        {options.map(o => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`tap flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${value === o.v ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">{icon}</div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

function Divider() { return <div className="mx-4 h-px bg-border" />; }

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`tap relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted-foreground/30"}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${on ? "start-[22px]" : "start-0.5"}`} />
    </button>
  );
}
