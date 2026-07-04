import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, Salad, TrendingUp, User } from "lucide-react";
import { useApp } from "@/lib/i18n";

export function AppShell() {
  const { t } = useApp();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const isAdminPage = pathname === "/admin";

  const tabs = [
    { to: "/", icon: Home, label: t.home },
    { to: "/plan", icon: Salad, label: t.myPlan },
    { to: "/progress", icon: TrendingUp, label: t.progress },
    { to: "/profile", icon: User, label: t.profile },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <main className={`flex-1 ${isAdminPage ? "" : "pb-24"}`}>
        <Outlet />
      </main>
      {!isAdminPage && (
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
          <ul className="grid grid-cols-4 px-2 pt-2">
            {tabs.map(({ to, icon: Icon, label }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className="tap flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium"
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
