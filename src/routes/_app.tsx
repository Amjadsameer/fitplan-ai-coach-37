import { createFileRoute, Navigate, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { isAuthed } = useAuth();
  const pathname = useRouterState({ select: s => s.location.pathname });
  if (!isAuthed) return <Navigate to="/login" search={{ redirect: pathname }} />;
  return <AppShell />;
}
