import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, KeyRound, Loader2, Plus, Shield, Trash2, UserPlus, Users, Zap, ZapOff, Check } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  listUsers, createUser, deleteUser, setUserAdmin,
  listProviderKeys, addProviderKey, activateProviderKey, deactivateAllKeys, deleteProviderKey,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { t, lang } = useApp();
  const { isAdmin, loading, user } = useAuth();
  const [tab, setTab] = useState<"users" | "keys">("users");

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold">{lang === "ar" ? "هذه الصفحة للمدراء فقط" : "Admins only"}</p>
          <Link to="/" className="mt-3 inline-block text-sm font-semibold text-primary">{lang === "ar" ? "العودة" : "Go back"}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 pb-10 pt-12 animate-fade-in-up">
      <header className="flex items-center gap-3">
        <Link to="/profile" className="tap grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground"><ArrowLeft className="h-4 w-4 rtl:rotate-180" /></Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Admin</p>
          <h1 className="text-2xl font-extrabold">{t.adminDashboard}</h1>
        </div>
      </header>

      <div className="flex gap-1 rounded-2xl bg-muted p-1">
        <button onClick={() => setTab("users")} className={`tap flex-1 rounded-xl py-2.5 text-xs font-bold ${tab === "users" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
          <Users className="me-1 inline h-3.5 w-3.5" /> {t.users}
        </button>
        <button onClick={() => setTab("keys")} className={`tap flex-1 rounded-xl py-2.5 text-xs font-bold ${tab === "keys" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
          <KeyRound className="me-1 inline h-3.5 w-3.5" /> API Keys
        </button>
      </div>

      {tab === "users" ? <UsersTab /> : <KeysTab />}
    </div>
  );
}

function UsersTab() {
  const { t, lang } = useApp();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", isAdmin: false });
  const [err, setErr] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsers(),
  });

  const create = useMutation({
    mutationFn: () => createUser({ data: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setOpen(false);
      setForm({ email: "", password: "", fullName: "", isAdmin: false });
      setErr(null);
    },
    onError: (e: Error) => setErr(e.message),
  });

  const del = useMutation({
    mutationFn: (userId: string) => deleteUser({ data: { userId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const toggleAdmin = useMutation({
    mutationFn: (v: { userId: string; isAdmin: boolean }) => setUserAdmin({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(true)} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow">
        <UserPlus className="h-4 w-4" /> {t.createUser}
      </button>

      {isLoading ? (
        <div className="grid place-items-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : (
        <ul className="space-y-2">
          {users?.map(u => {
            const isAdminUser = u.roles.includes("admin");
            const self = u.id === user?.id;
            return (
              <li key={u.id} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{u.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {isAdminUser && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">ADMIN</span>}
                      {self && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{lang === "ar" ? "أنت" : "You"}</span>}
                      <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!self && (
                      <button
                        onClick={() => toggleAdmin.mutate({ userId: u.id, isAdmin: !isAdminUser })}
                        className={`tap grid h-8 w-8 place-items-center rounded-lg ${isAdminUser ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                        title={isAdminUser ? t.demoteAdmin : t.promoteAdmin}
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {!self && (
                      <button
                        onClick={() => { if (confirm(lang === "ar" ? "حذف هذا المستخدم؟" : "Delete this user?")) del.mutate(u.id); }}
                        className="tap grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)} title={t.createUser}>
          <div className="space-y-3">
            <Field label={t.email}><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-border bg-input/40 px-3 py-2.5 text-sm outline-none focus:border-primary" /></Field>
            <Field label={t.password}><input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="min 6 chars" className="w-full rounded-xl border border-border bg-input/40 px-3 py-2.5 text-sm outline-none focus:border-primary" /></Field>
            <Field label={lang === "ar" ? "الاسم الكامل" : "Full name"}><input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-xl border border-border bg-input/40 px-3 py-2.5 text-sm outline-none focus:border-primary" /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isAdmin} onChange={e => setForm({ ...form, isAdmin: e.target.checked })} className="h-4 w-4 accent-[var(--color-primary)]" /> {lang === "ar" ? "صلاحية مدير" : "Grant admin"}</label>
            {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
            <button onClick={() => create.mutate()} disabled={create.isPending} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60">
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {t.createUser}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function KeysTab() {
  const { t, lang } = useApp();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ provider: "gemini" | "openai"; label: string; apiKey: string; activate: boolean }>({ provider: "gemini", label: "", apiKey: "", activate: true });
  const [err, setErr] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["admin-keys"],
    queryFn: () => listProviderKeys(),
  });

  const add = useMutation({
    mutationFn: () => addProviderKey({ data: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-keys"] });
      setOpen(false);
      setForm({ provider: "gemini", label: "", apiKey: "", activate: true });
      setErr(null);
    },
    onError: (e: Error) => setErr(e.message),
  });
  const activate = useMutation({ mutationFn: (id: string) => activateProviderKey({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-keys"] }) });
  const deactivate = useMutation({ mutationFn: () => deactivateAllKeys(), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-keys"] }) });
  const del = useMutation({ mutationFn: (id: string) => deleteProviderKey({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-keys"] }) });

  const active = keys?.find(k => k.is_active);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.activeProvider}</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="font-bold">{active ? `${active.provider.toUpperCase()} — ${active.label}` : (lang === "ar" ? "افتراضي (Lovable AI)" : "Default (Lovable AI)")}</p>
          {active && (
            <button onClick={() => deactivate.mutate()} className="tap rounded-full bg-muted px-3 py-1 text-xs font-semibold">
              <ZapOff className="me-1 inline h-3 w-3" /> {t.useDefault}
            </button>
          )}
        </div>
      </div>

      <button onClick={() => setOpen(true)} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow">
        <Plus className="h-4 w-4" /> {t.addKey}
      </button>

      {isLoading ? (
        <div className="grid place-items-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : keys?.length ? (
        <ul className="space-y-2">
          {keys.map(k => (
            <li key={k.id} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">{k.provider}</span>
                    <p className="truncate text-sm font-bold">{k.label}</p>
                    {k.is_active && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground"><Check className="me-0.5 inline h-2.5 w-2.5" />{t.active}</span>}
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{k.key_preview}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!k.is_active && (
                    <button onClick={() => activate.mutate(k.id)} className="tap grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary" title={t.activate}>
                      <Zap className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => { if (confirm(lang === "ar" ? "حذف هذا المفتاح؟" : "Delete this key?")) del.mutate(k.id); }} className="tap grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">{lang === "ar" ? "لا توجد مفاتيح. التطبيق يستخدم Lovable AI افتراضياً." : "No keys yet. App uses Lovable AI by default."}</p>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)} title={t.addKey}>
          <div className="space-y-3">
            <Field label={lang === "ar" ? "المزوّد" : "Provider"}>
              <div className="flex gap-1.5">
                {(["gemini", "openai"] as const).map(p => (
                  <button key={p} onClick={() => setForm({ ...form, provider: p })} className={`tap flex-1 rounded-xl py-2 text-xs font-bold ${form.provider === p ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>{p.toUpperCase()}</button>
                ))}
              </div>
            </Field>
            <Field label={lang === "ar" ? "وصف" : "Label"}><input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="My Gemini key" className="w-full rounded-xl border border-border bg-input/40 px-3 py-2.5 text-sm outline-none focus:border-primary" /></Field>
            <Field label="API Key"><input type="text" value={form.apiKey} onChange={e => setForm({ ...form, apiKey: e.target.value })} placeholder={form.provider === "gemini" ? "AIza..." : "sk-..."} className="w-full rounded-xl border border-border bg-input/40 px-3 py-2.5 text-sm outline-none focus:border-primary font-mono" /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.activate} onChange={e => setForm({ ...form, activate: e.target.checked })} className="h-4 w-4 accent-[var(--color-primary)]" /> {t.activateNow}</label>
            {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
            <button onClick={() => add.mutate()} disabled={add.isPending} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60">
              {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {t.save}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>{children}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 backdrop-blur-sm sm:place-items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-background p-5 shadow-2xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="tap rounded-full bg-muted px-3 py-1 text-xs font-semibold">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
