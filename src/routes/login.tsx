import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Dumbbell, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) ?? "" }),
  component: LoginPage,
});

function LoginPage() {
  const { t, lang, setLang } = useApp();
  const { isAuthed, isAdmin, login } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dest = (redirect && redirect !== "/login" ? redirect : (isAdmin ? "/admin" : "/")) as "/";
  if (isAuthed && !busy) return <Navigate to={dest} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErr(lang === "ar" ? "أدخل البريد وكلمة المرور" : "Enter email and password"); return; }
    setBusy(true); setErr(null);
    const { error, userId } = await login(email, password);
    if (error) {
      setBusy(false);
      setErr(lang === "ar" ? "بيانات الدخول غير صحيحة" : error);
      return;
    }
    let target: string = redirect && redirect !== "/login" ? redirect : "/";
    if (userId && (!redirect || redirect === "/login")) {
      const { data: role, error: rErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      console.log("[login] role check", { userId, role, rErr });
      if (role) target = "/admin";
    }
    setBusy(false);
    navigate({ to: target as "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <div className="bg-gradient-hero relative overflow-hidden px-6 pb-12 pt-16 text-primary-foreground">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold tracking-tight">{t.appName}</h1>
              <p className="truncate text-sm opacity-90">{t.tagline}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="tap shrink-0 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur"
          >
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="-mt-6 flex-1 space-y-4 rounded-t-3xl bg-background px-6 pb-10 pt-8 animate-fade-in-up">
        <h2 className="text-xl font-bold">{t.login}</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t.email}</label>
          <input
            type="email"
            autoComplete="email"
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
              autoComplete="current-password"
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

        {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{err}</p>}

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary">{t.forgotPassword}</Link>
        </div>

        <button type="submit" disabled={busy} className="tap mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.signIn}
        </button>
      </form>
    </div>
  );
}
