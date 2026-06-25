import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
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

const WeeklyInputSchema = z.object({
  goal: z.enum(["bulk", "cut", "lose"]),
  budget: z.number().positive(),
  currency: z.string().max(8).default("USD"),
  lang: z.enum(["en", "ar"]).default("en"),
  profile: z.object({
    height: z.number().positive(),
    weight: z.number().positive(),
    age: z.number().int().positive(),
    sex: z.enum(["male", "female"]),
    activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  }).optional(),
});

const DayMealSchema = z.object({
  type: z.string(),
  name: z.string(),
  items: z.array(z.object({ name: z.string(), qty: z.string() })).min(1).max(8),
  kcal: z.number(),
  p: z.number(),
  c: z.number(),
  f: z.number(),
  cost: z.number(),
});
const DaySchema = z.object({
  day: z.string(),
  totalKcal: z.number(),
  totalCost: z.number(),
  meals: z.array(DayMealSchema).min(3).max(5),
});
const WeeklyPlanSchema = z.object({
  goal: z.string(),
  dailyKcalTarget: z.number(),
  weeklyBudget: z.number(),
  currency: z.string(),
  days: z.array(DaySchema).length(7),
});

export const generateWeeklyPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => WeeklyInputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const lang = data.lang === "ar" ? "Arabic" : "English";
    const goalMap = {
      bulk: "muscle gain / bulking (calorie surplus, high protein ~2g/kg)",
      cut: "cutting / lean definition (moderate deficit, very high protein, low fat)",
      lose: "weight loss (clear calorie deficit, high protein, high fiber)",
    } as const;

    let profileBlock = "";
    if (data.profile) {
      const p = data.profile;
      const base = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "male" ? 5 : -161);
      const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[p.activity];
      const tdee = Math.round(base * mult);
      const target = data.goal === "bulk" ? tdee + 350 : data.goal === "cut" ? tdee - 400 : tdee - 500;
      const proteinG = Math.round(p.weight * (data.goal === "bulk" ? 2 : data.goal === "cut" ? 2.2 : 1.8));
      profileBlock = `\nUser profile: ${p.sex}, age ${p.age}, height ${p.height}cm, weight ${p.weight}kg, activity ${p.activity}.
Estimated TDEE: ~${tdee} kcal. Target daily intake: ~${target} kcal (±5%). Target protein: ~${proteinG}g/day.
Use dailyKcalTarget = ${target} and design every day's totalKcal within ±5% of that.`;
    }

    const prompt = `Build a 7-day meal plan for the goal: ${goalMap[data.goal]}.${profileBlock}
Total weekly food budget: ${data.budget} ${data.currency} (sum of all days must be <= budget, prefer ~90-100% utilization).
Each day must have 4 meals (breakfast, lunch, dinner, snack) with realistic ingredients, quantities (with units), kcal, protein/carbs/fat in grams, and an estimated cost in ${data.currency}.
Respond in ${lang}. Keep names short. Realistic macros that match kcal.

Respond ONLY with a valid JSON object (no markdown, no prose) matching:
{
  "goal": string,
  "dailyKcalTarget": number,
  "weeklyBudget": number,
  "currency": string,
  "days": [
    {
      "day": string,
      "totalKcal": number,
      "totalCost": number,
      "meals": [
        { "type": string, "name": string, "items": [{ "name": string, "qty": string }], "kcal": number, "p": number, "c": number, "f": number, "cost": number }
      ]
    }
  ]
}
Exactly 7 day entries.`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
      });
      let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const start = cleaned.search(/[\{\[]/);
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);
      const parsed = JSON.parse(cleaned);
      return WeeklyPlanSchema.parse(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("generateWeeklyPlan failed:", msg);
      if (msg.includes("429")) throw new Error("RATE_LIMITED");
      if (msg.includes("402")) throw new Error("CREDITS_EXHAUSTED");
      throw new Error(`AI_ERROR: ${msg.slice(0, 200)}`);
    }
  });
