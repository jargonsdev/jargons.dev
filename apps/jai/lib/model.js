/**
 * jAI Model Selection Notes
 *
 * Different OpenAI models fit different parts of the jAI ecosystem.
 * This file currently exports a singleton chat model, but future adjustments
 * may dynamically select models depending on usecase.
 *
 * 📌 Recommended Defaults:
 * - gpt-4.1-mini → Balanced, tunable (supports temperature < 1), cost-efficient.
 *   Ideal for most jAI features: search fallback, follow-up chat, contribution copilot.
 *
 * - gpt-5-mini → Ultra-fast, cheaper at scale, but temperature is fixed (1).
 *   Use when speed/cost dominate and variability is acceptable.
 *   Good for lightweight lookups (e.g., extensions, quick responses).
 *
 * - gpt-4.1 or gpt-5 (full models) → High reasoning depth and reliability.
 *   Reserved for heavier tasks: advanced quizzes, deep analogies, or critical reviews.
 *
 * ✅ Suggested Tiered Use Strategy:
 * - Dictionary fallback (Search with jAI): gpt-4.1-mini - https://github.com/jargonsdev/roadmap/issues/8
 * - Word follow-up chat: gpt-4.1-mini - https://github.com/jargonsdev/roadmap/issues/6
 * - Contribution AI reviewer/copilot: gpt-4.1-mini - https://github.com/jargonsdev/roadmap/issues/11
 * - Extensions/fast lookups: gpt-5-mini - https://github.com/jargonsdev/roadmap/issues/2
 * - Advanced reasoning/quiz generation: gpt-4.1 or gpt-5 - https://github.com/jargonsdev/roadmap/issues/7
 *
 * This structure ensures a balance between speed, cost, and reasoning quality,
 * while allowing flexibility for scaling different features of jargons.dev.
 */

import { ChatOpenAI } from "@langchain/openai";

// Create the model
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY,
  model: process.env.OPENAI_CHAT_MODEL || import.meta.env.OPENAI_CHAT_MODEL,
  temperature: 0.2,
  maxTokens: 1024,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
  streaming: true,
  verbose: process.env.NODE_ENV !== "production",
});

export { model as default };
