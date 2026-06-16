import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/i18n";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6 pt-12">
      <Link to="/login" className="tap inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border">
        <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
      </Link>
      <div className="mt-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">{t.resetPassword}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.resetInstructions}</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="mt-8 space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t.email}
          className="w-full rounded-2xl border border-border bg-input/40 px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button className="tap w-full rounded-2xl bg-gradient-primary py-4 font-semibold text-primary-foreground shadow-glow">
          {t.sendLink}
        </button>
        {sent && (
          <p className="rounded-xl bg-success/15 px-4 py-3 text-sm text-success">✓ Sent to {email || "your email"}</p>
        )}
      </form>
      <Link to="/login" className="mt-auto py-8 text-center text-sm font-semibold text-primary">
        {t.backToLogin}
      </Link>
    </div>
  );
}
