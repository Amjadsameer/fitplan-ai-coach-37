import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Bell, Droplets, Globe, LogOut, Moon, Ruler, Scale, Sun, Target, User as UserIcon, Utensils } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const name = (email?.split("@")[0] ?? "Athlete").replace(/^\w/, c => c.toUpperCase());

  return (
    <div className="space-y-5 px-5 pb-8 pt-12 animate-fade-in-up">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.profile}</p>
        <h1 className="text-2xl font-extrabold">{t.personalInfo}</h1>
      </header>

      {/* Profile card */}
      <section className="flex items-center gap-4 rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <UserIcon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold">{name}</p>
          <p className="truncate text-xs opacity-90">{email ?? "athlete@fitplan.ai"}</p>
          <span className="mt-1.5 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">Premium</span>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-3">
        <InfoCard icon={<Ruler className="h-4 w-4" />} label={t.height} value="178 cm" />
        <InfoCard icon={<Scale className="h-4 w-4" />} label={t.weight} value={`78.4 ${t.kg}`} />
        <InfoCard icon={<Target className="h-4 w-4" />} label={t.goal} value={t.loseWeight} />
        <InfoCard icon={<Activity className="h-4 w-4" />} label={t.activityLevel} value={t.moderate} />
      </section>

      {/* Settings */}
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

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">{icon}</div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-base font-bold">{value}</p>
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

import { useState } from "react";
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
