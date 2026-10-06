import express from "express";
import swaggerUi from "swagger-ui-express";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "./repository.js";

const app = express();
app.use(express.json());

const openapi = {
  openapi: "3.0.3",
  info: { title: "Containerized Task API", version: "3.0.0" },
  paths: {
    "/tasks": { get: { responses: { 200: { description: "Task list" } } }, post: { responses: { 201: { description: "Created" }, 400: { description: "Invalid title" } } } },
    "/tasks/{id}": { get: { responses: { 200: { description: "Task" }, 404: { description: "Not found" } } }, put: { responses: { 200: { description: "Updated" }, 400: { description: "Invalid body" }, 404: { description: "Not found" } } }, delete: { responses: { 204: { description: "Deleted" }, 404: { description: "Not found" } } } },
  },
};

const notFound = (res, id) => res.status(404).json({ error: "Task " + id + " not found" });
const parseDone = (value) => value === "true" ? true : value === "false" ? false : undefined;

app.get("/", (_req, res) => res.json({ name: "Containerized Task API", version: "3.0", endpoints: ["/tasks"] }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/tasks", async (req, res) => res.json(await listTasks({ search: typeof req.query.search === "string" ? req.query.search : undefined, done: parseDone(req.query.done) })));
app.get("/tasks/:id", async (req, res) => {
  const found = await getTask(req.params.id);
  return found ? res.json(found) : notFound(res, req.params.id);
});
app.post("/tasks", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) return res.status(400).json({ error: "title is required" });
  return res.status(201).json(await createTask(title));
});
app.put("/tasks/:id", async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ error: "request body must be an object" });
  const { title, done } = req.body;
  if (title === undefined && done === undefined) return res.status(400).json({ error: "title or done is required" });
  if (title !== undefined && (typeof title !== "string" || !title.trim())) return res.status(400).json({ error: "title must be a non-empty string" });
  if (done !== undefined && typeof done !== "boolean") return res.status(400).json({ error: "done must be a boolean" });
  const updated = await updateTask(req.params.id, { title: title?.trim(), done });
  return updated ? res.json(updated) : notFound(res, req.params.id);
});
app.delete("/tasks/:id", async (req, res) => {
  return await deleteTask(req.params.id) ? res.status(204).send() : notFound(res, req.params.id);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

export { app };
