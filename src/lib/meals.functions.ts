import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  mealType: z.string().min(1),
  targetKcal: z.number().int().positive(),
  ingredients: z.string().max(500).optional().default(""),
  lang: z.enum(["en", "ar"]).default("en"),
});

const RecipeSchema = z.object({
  name: z.string(),
  items: z.array(z.object({ name: z.string(), qty: z.string() })).min(1).max(8),
  kcal: z.number(),
  p: z.number(),
  c: z.number(),
  f: z.number(),
});

export const generateMealSwap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const lang = data.lang === "ar" ? "Arabic" : "English";
    const ingHint = data.ingredients?.trim()
      ? `The user has these ingredients available: ${data.ingredients}. Build the recipe primarily around them.`
      : `Pick common, healthy ingredients.`;

    const prompt = `Create a single healthy ${data.mealType} recipe.
Target: ~${data.targetKcal} kcal (within ±5%).
${ingHint}
Respond in ${lang}. Keep item names short. Quantities must include units (g, ml, pcs, cup).
Provide realistic protein (p), carbs (c), fat (f) in grams that match the calorie target.`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt: `${prompt}

Respond ONLY with a valid JSON object (no markdown fences, no prose) matching:
{ "name": string, "items": { "name": string, "qty": string }[], "kcal": number, "p": number, "c": number, "f": number }`,
      });

      let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const start = cleaned.search(/[\{\[]/);
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);

      const parsed = JSON.parse(cleaned);
      return RecipeSchema.parse(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("generateMealSwap failed:", msg);
      if (msg.includes("429")) throw new Error("RATE_LIMITED");
      if (msg.includes("402")) throw new Error("CREDITS_EXHAUSTED");
      throw new Error(`AI_ERROR: ${msg.slice(0, 200)}`);
    }
  });
