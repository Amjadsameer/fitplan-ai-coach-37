import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export function createOpenAIProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "openai",
    baseURL: "https://api.openai.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

/**
 * Picks the active AI provider:
 *   - If admin set an active provider key in DB, use it.
 *   - Otherwise, fall back to LOVABLE_API_KEY through the Lovable gateway.
 */
export async function getActiveAiModel() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("ai_provider_keys")
    .select("provider, api_key")
    .eq("is_active", true)
    .maybeSingle();

  if (data?.provider === "gemini") {
    return { model: createGeminiProvider(data.api_key)("gemini-2.0-flash") };
  }
  if (data?.provider === "openai") {
    return { model: createOpenAIProvider(data.api_key)("gpt-4o-mini") };
  }
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("No AI provider configured (no active key and no LOVABLE_API_KEY)");
  return { model: createLovableAiGatewayProvider(key)("google/gemini-3-flash-preview") };
}
