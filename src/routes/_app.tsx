import { createFileRoute, Navigate, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { isAuthed, isAdmin, loading } = useAuth();
  const pathname = useRouterState({ select: s => s.location.pathname });
  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAuthed) return <Navigate to="/login" search={{ redirect: pathname }} />;
  if (isAdmin && pathname !== "/admin") return <Navigate to="/admin" />;
  return <AppShell />;
}
