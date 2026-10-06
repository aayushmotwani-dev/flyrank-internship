export const quizSchema = {
  type: "object",
  properties: {
    questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 }, answerIndex: { type: "integer", minimum: 0, maximum: 3 }, explanation: { type: "string" } }, required: ["question", "options", "answerIndex", "explanation"], additionalProperties: false } },
  },
  required: ["questions"],
  additionalProperties: false,
};

export function validateQuiz(value, expectedCount) {
  if (!value || typeof value !== "object" || !Array.isArray(value.questions)) return { ok: false, error: "response must contain questions" };
  if (value.questions.length !== expectedCount) return { ok: false, error: "expected " + expectedCount + " questions" };
  for (const [index, item] of value.questions.entries()) {
    if (!item || typeof item.question !== "string" || !item.question.trim()) return { ok: false, error: "question " + (index + 1) + " is missing text" };
    if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some((option) => typeof option !== "string" || !option.trim())) return { ok: false, error: "question " + (index + 1) + " must have four options" };
    if (new Set(item.options.map((option) => option.trim().toLowerCase())).size !== 4) return { ok: false, error: "question " + (index + 1) + " has duplicate options" };
    if (!Number.isInteger(item.answerIndex) || item.answerIndex < 0 || item.answerIndex > 3) return { ok: false, error: "question " + (index + 1) + " has an invalid answer index" };
    if (typeof item.explanation !== "string" || !item.explanation.trim()) return { ok: false, error: "question " + (index + 1) + " is missing an explanation" };
  }
  return { ok: true, value };
}
