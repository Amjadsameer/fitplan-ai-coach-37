import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthCtx {
  isAuthed: boolean;
  login: (email: string, remember: boolean) => void;
  logout: () => void;
  email: string | null;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("fp_email") : null;
    if (saved) setEmail(saved);
  }, []);
  return (
    <Ctx.Provider value={{
      isAuthed: !!email,
      email,
      login: (e, remember) => {
        setEmail(e);
        if (remember) localStorage.setItem("fp_email", e);
      },
      logout: () => { setEmail(null); localStorage.removeItem("fp_email"); },
    }}>{children}</Ctx.Provider>
  );
}
export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth requires AuthProvider");
  return c;
}
