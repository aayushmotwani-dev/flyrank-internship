import express from "express";
import { createGeminiClient } from "./gemini-client.js";
import { generateQuiz } from "./quiz-service.js";

const difficulties = new Set(["easy", "medium", "hard"]);
function validateInput(body) {
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  const difficulty = typeof body?.difficulty === "string" ? body.difficulty : "";
  const questionCount = body?.questionCount;
  if (!topic || topic.length > 120) return { error: "topic is required and must be at most 120 characters" };
  if (!difficulties.has(difficulty)) return { error: "difficulty must be easy, medium, or hard" };
  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 10) return { error: "questionCount must be an integer from 1 to 10" };
  return { value: { topic, difficulty, questionCount } };
}

export function createApp({ provider, enabled = process.env.AI_ENABLED !== "false", logger = console } = {}) {
  const app = express();
  app.use(express.json({ limit: "10kb" }));
  app.get("/health", (_request, response) => response.json({ status: "ok", aiEnabled: enabled }));
  app.post("/quiz", async (request, response) => {
    const input = validateInput(request.body);
    if (input.error) return response.status(400).json({ error: input.error });
    if (!enabled) return response.status(503).json({ error: "AI feature is disabled" });
    try {
      const quiz = await generateQuiz(provider ?? createGeminiClient(), input.value, { logger });
      return response.json(quiz);
    } catch (error) {
      logger.error("ai_request_failed", error.message);
      return response.status(error.name === "TimeoutError" ? 504 : 502).json({ error: "AI response could not be validated" });
    }
  });
  return app;
}
