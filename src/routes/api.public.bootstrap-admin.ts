import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().max(100).optional(),
});

export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: z.infer<typeof Body>;
        try {
          payload = Body.parse(await request.json());
        } catch (e) {
          return Response.json({ error: "invalid_body", detail: String(e) }, { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { count } = await supabaseAdmin
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");
        if ((count ?? 0) > 0) {
          return Response.json({ error: "already_initialized" }, { status: 409 });
        }
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: payload.email,
          password: payload.password,
          email_confirm: true,
          user_metadata: { full_name: payload.fullName ?? "Admin" },
        });
        if (error || !created.user) {
          return Response.json({ error: error?.message ?? "create_failed" }, { status: 500 });
        }
        await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: created.user.id, role: "admin" }, { onConflict: "user_id,role" });
        return Response.json({ ok: true, id: created.user.id, email: created.user.email });
      },
    },
  },
});
