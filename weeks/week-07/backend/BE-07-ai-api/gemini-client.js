import { quizSchema } from "./ai-schema.js";

const endpoint = (model) => "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function createGeminiClient({ apiKey = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash", fetchImpl = fetch, sleepImpl = sleep, timeoutMs = 12000, retries = 2 } = {}) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");
  async function request(prompt) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetchImpl(endpoint(model), { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, signal: AbortSignal.timeout(timeoutMs), body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: quizSchema } }) });
        const body = await response.json();
        if (!response.ok) {
          const error = new Error(body?.error?.message ?? "Gemini request failed");
          error.status = response.status;
          if (![429, 500, 502, 503, 504].includes(response.status) || attempt === retries) throw error;
          lastError = error;
        } else {
          return { text: body?.candidates?.[0]?.content?.parts?.[0]?.text ?? "", usage: body?.usageMetadata ?? null };
        }
      } catch (error) {
        lastError = error;
        if (attempt === retries || (error.status && ![429, 500, 502, 503, 504].includes(error.status))) throw error;
      }
      await sleepImpl(250 * (attempt + 1));
    }
    throw lastError;
  }
  return { request };
}
