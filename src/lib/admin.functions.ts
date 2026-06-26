import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin required");
}

// ---------- Users ----------
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);
    const ids = users.users.map(u => u.id);
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }
    return users.users.map(u => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: roleMap.get(u.id) ?? [],
    }));
  });

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      fullName: z.string().max(100).optional(),
      isAdmin: z.boolean().default(false),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName ?? "" },
    });
    if (error) throw new Error(error.message);
    if (data.isAdmin && created.user) {
      await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    }
    return { id: created.user?.id ?? null };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), isAdmin: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.userId === context.userId && !data.isAdmin) throw new Error("Cannot demote yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.isAdmin) {
      await supabaseAdmin.from("user_roles").upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    }
    return { ok: true };
  });

// ---------- AI Provider Keys ----------
export const listProviderKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ai_provider_keys")
      .select("id, provider, label, is_active, created_at, api_key")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(k => ({
      id: k.id,
      provider: k.provider,
      label: k.label,
      is_active: k.is_active,
      created_at: k.created_at,
      key_preview: maskKey(k.api_key),
    }));
  });

function maskKey(k: string) {
  if (!k) return "";
  if (k.length <= 8) return "•".repeat(k.length);
  return `${k.slice(0, 4)}••••${k.slice(-4)}`;
}

export const addProviderKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      provider: z.enum(["gemini", "openai"]),
      label: z.string().min(1).max(50),
      apiKey: z.string().min(10).max(500),
      activate: z.boolean().default(false),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.activate) {
      await supabaseAdmin.from("ai_provider_keys").update({ is_active: false }).eq("is_active", true);
    }
    const { error } = await supabaseAdmin.from("ai_provider_keys").insert({
      provider: data.provider,
      label: data.label,
      api_key: data.apiKey,
      is_active: data.activate,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const activateProviderKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_provider_keys").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabaseAdmin.from("ai_provider_keys").update({ is_active: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deactivateAllKeys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_provider_keys").update({ is_active: false }).eq("is_active", true);
    return { ok: true };
  });

export const deleteProviderKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ai_provider_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Bootstrap (no auth; works only if no admin exists yet) ----------
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      fullName: z.string().max(100).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("ALREADY_INITIALIZED");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName ?? "Admin" },
    });
    if (error) throw new Error(error.message);
    if (!created.user) throw new Error("User not created");
    await supabaseAdmin.from("user_roles").upsert({ user_id: created.user.id, role: "admin" }, { onConflict: "user_id,role" });
    return { ok: true, id: created.user.id };
  });
