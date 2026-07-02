import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthCtx {
  isAuthed: boolean;
  loading: boolean;
  user: User | null;
  email: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setLoading(false);
      if (s?.user) setTimeout(() => void refreshRole(s.user.id), 0);
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) void refreshRole(data.session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function refreshRole(uid: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  }

  return (
    <Ctx.Provider value={{
      isAuthed: !!session,
      loading,
      user: session?.user ?? null,
      email: session?.user?.email ?? null,
      isAdmin,
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null, userId: data.user?.id ?? null };
      },
      logout: async () => { await supabase.auth.signOut(); },
    }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth requires AuthProvider");
  return c;
}
