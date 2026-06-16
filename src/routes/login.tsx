import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Dumbbell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) ?? "/" }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useApp();
  const { isAuthed, login } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);

  if (isAuthed) return <Navigate to="/" />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || "athlete@fitplan.ai", remember);
    navigate({ to: redirect || "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <div className="bg-gradient-hero relative overflow-hidden px-6 pb-12 pt-16 text-primary-foreground">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t.appName}</h1>
            <p className="text-sm opacity-90">{t.tagline}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="-mt-6 flex-1 space-y-4 rounded-t-3xl bg-background px-6 pb-10 pt-8 animate-fade-in-up">
        <h2 className="text-xl font-bold">{t.login}</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t.email}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@gym.com"
            className="w-full rounded-2xl border border-border bg-input/40 px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t.password}</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-border bg-input/40 px-4 py-3.5 pe-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
            <span>{t.rememberMe}</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-semibold text-primary">{t.forgotPassword}</Link>
        </div>

        <button type="submit" className="tap mt-2 w-full rounded-2xl bg-gradient-primary py-4 font-semibold text-primary-foreground shadow-glow">
          {t.signIn}
        </button>
      </form>
    </div>
  );
}
