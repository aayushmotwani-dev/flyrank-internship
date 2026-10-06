import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import express from "express";
import swaggerUi from "swagger-ui-express";

const app = express();
const db = new DatabaseSync(process.env.DB_PATH ?? path.join(process.cwd(), "tasks.db"));

db.exec("\n  CREATE TABLE IF NOT EXISTS tasks (\n    id INTEGER PRIMARY KEY,\n    title TEXT NOT NULL,\n    done INTEGER NOT NULL DEFAULT 0\n  )\n");
if (db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count === 0) {
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  for (const [title, done] of [["Read the assignment", 1], ["Connect SQLite", 0], ["Test persistence", 0]]) insert.run(title, done);
}

app.use(express.json());

const openapi = {
  openapi: "3.0.3",
  info: { title: "Task API", version: "2.0.0" },
  paths: {
    "/tasks": { get: { responses: { 200: { description: "Task list" } } }, post: { responses: { 201: { description: "Created" }, 400: { description: "Invalid title" } } } },
    "/tasks/{id}": { get: { responses: { 200: { description: "Task" }, 404: { description: "Not found" } } }, put: { responses: { 200: { description: "Updated" }, 400: { description: "Invalid body" }, 404: { description: "Not found" } } }, delete: { responses: { 204: { description: "Deleted" }, 404: { description: "Not found" } } } },
  },
};

const task = (row) => row && { id: row.id, title: row.title, done: Boolean(row.done) };
const findTask = (id) => db.prepare("SELECT id, title, done FROM tasks WHERE id = ?").get(Number(id));
const notFound = (res, id) => res.status(404).json({ error: "Task " + id + " not found" });

app.get("/", (_req, res) => res.json({ name: "Task API", version: "2.0", endpoints: ["/tasks"] }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/tasks", (req, res) => {
  const search = typeof req.query.search === "string" ? "%" + req.query.search + "%" : null;
  const done = req.query.done === "true" ? 1 : req.query.done === "false" ? 0 : null;
  const rows = db.prepare("SELECT id, title, done FROM tasks WHERE (? IS NULL OR title LIKE ?) AND (? IS NULL OR done = ?) ORDER BY id").all(search, search, done, done);
  res.json(rows.map(task));
});
app.get("/tasks/:id", (req, res) => {
  const found = findTask(req.params.id);
  return found ? res.json(task(found)) : notFound(res, req.params.id);
});
app.post("/tasks", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) return res.status(400).json({ error: "title is required" });
  const result = db.prepare("INSERT INTO tasks (title, done) VALUES (?, 0)").run(title);
  return res.status(201).json(task(findTask(result.lastInsertRowid)));
});
app.put("/tasks/:id", (req, res) => {
  if (!findTask(req.params.id)) return notFound(res, req.params.id);
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ error: "request body must be an object" });
  const { title, done } = req.body;
  if (title === undefined && done === undefined) return res.status(400).json({ error: "title or done is required" });
  if (title !== undefined && (typeof title !== "string" || !title.trim())) return res.status(400).json({ error: "title must be a non-empty string" });
  if (done !== undefined && typeof done !== "boolean") return res.status(400).json({ error: "done must be a boolean" });
  const current = findTask(req.params.id);
  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(title === undefined ? current.title : title.trim(), done === undefined ? current.done : Number(done), Number(req.params.id));
  return res.json(task(findTask(req.params.id)));
});
app.delete("/tasks/:id", (req, res) => {
  if (!findTask(req.params.id)) return notFound(res, req.params.id);
  db.prepare("DELETE FROM tasks WHERE id = ?").run(Number(req.params.id));
  return res.status(204).send();
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

export { app, db };
