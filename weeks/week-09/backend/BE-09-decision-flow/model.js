import OpenAI from "openai";
import { normalizeDecision } from "./workflow.js";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function decidePrompt(prompt) {
  if (process.env.MODEL_MODE === "mock") return /urgent|ready|yes|continue/i.test(prompt) ? "YES" : "NO";
  if (!client) throw new Error("OPENAI_API_KEY is not configured");

  const response = await Promise.race([
    client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: "Return exactly one token: YES or NO. Do not add punctuation or explanation.",
      input: prompt
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("OpenAI request timed out")), 12000))
  ]);
  return normalizeDecision(response.output_text);
}
