## Plan: AI-powered meal swap with custom ingredients

Add a smart "Swap meal" flow that uses Lovable AI to generate a replacement recipe matching the original meal's calorie target. User can either:
1. Enter ingredients they have on hand → AI builds a recipe around them
2. Leave empty → AI suggests a fully alternative recipe

The generated recipe replaces the current meal variant in the UI.

### Steps

1. **Enable Lovable Cloud** — required to call Lovable AI securely server-side (key never reaches the browser).

2. **Create server function** `src/lib/meals.functions.ts` with `generateMealSwap`:
   - Input: `{ mealType, targetKcal, ingredients?: string, lang: "en"|"ar" }`
   - Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with structured output (Zod schema): `{ name, items: [{name, qty}], kcal, p, c, f }`
   - Prompt instructs the model to honor target calories (±5%), use provided ingredients when present, and respond in the user's language.

3. **Update `src/routes/_app.plan.tsx`**:
   - Replace the current "swap" button behavior with a dialog/sheet that shows:
     - Target kcal (locked, from the meal)
     - Textarea: "المكونات المتوفرة (اختياري)"
     - "توليد بالذكاء الاصطناعي" button
   - On submit: call `generateMealSwap`, show loading spinner, then inject the returned recipe as the active variant for that meal (in-memory `Record<mealId, MealVariant>` override layered on top of `getVariant`).
   - Keep the existing static variant cycling as a fallback only if the user closes the dialog without generating.
   - Show toast on success/error; surface 429/402 gateway errors with clear Arabic/English messages.

4. **i18n additions** in `src/lib/i18n.tsx`: `aiSwap`, `availableIngredients`, `ingredientsPlaceholder`, `generate`, `generating`, `targetCalories`, `aiError`, `rateLimited`, `creditsExhausted`.

### Technical notes

- Provider: AI SDK + `@ai-sdk/openai-compatible` against `https://ai.gateway.lovable.dev/v1`, key from `process.env.LOVABLE_API_KEY`.
- Use `generateText` with `Output.object({ schema })` — schema kept small (5 fields) to avoid Gemini state limits.
- Server function is public (no auth required for this feature) — input is validated with Zod, no DB writes.
- Frontend keeps favorites/completed logic untouched; only the variant resolver changes to prefer an AI override when present.
- No DB tables created; generated recipes live in component state only.
