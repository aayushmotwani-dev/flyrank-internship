import { validateQuiz } from "./ai-schema.js";

export function buildPrompt({ topic, difficulty, questionCount }) {
  return ["Create a multiple-choice quiz.", "Topic: " + topic, "Difficulty: " + difficulty, "Question count: " + questionCount, "Return only JSON matching the supplied schema. Each question must have four distinct options, answerIndex 0-3, and a short explanation."].join("\n");
}

export async function generateQuiz(provider, input, { logger = console } = {}) {
  const prompt = buildPrompt(input);
  const first = await provider.request(prompt);
  logger.info("ai_usage", first.usage ?? {});
  let parsed;
  try { parsed = JSON.parse(first.text); } catch { parsed = null; }
  let checked = validateQuiz(parsed, input.questionCount);
  if (checked.ok) return checked.value;
  const repair = await provider.request(prompt + "\nRepair this invalid candidate and return only valid JSON. Candidate:\n" + first.text);
  logger.info("ai_repair_usage", repair.usage ?? {});
  try { parsed = JSON.parse(repair.text); } catch { parsed = null; }
  checked = validateQuiz(parsed, input.questionCount);
  if (!checked.ok) { const error = new Error(checked.error); error.code = "AI_SCHEMA_INVALID"; throw error; }
  return checked.value;
}
