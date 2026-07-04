import { createFileRoute, Navigate, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { isOnboarded } from "@/lib/onboarding";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { isAuthed, isAdmin, loading, user } = useAuth();
  const pathname = useRouterState({ select: s => s.location.pathname });
  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAuthed) return <Navigate to="/login" search={{ redirect: pathname }} />;
  if (isAdmin && pathname !== "/admin") return <Navigate to="/admin" />;
  if (!isAdmin && user && !isOnboarded(user.id) && pathname !== "/onboarding") return <Navigate to="/onboarding" />;
  return <AppShell />;
}
