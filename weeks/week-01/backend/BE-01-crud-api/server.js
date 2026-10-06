import express from "express";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

let tasks = [
  { id: 1, title: "Read the assignment", done: true },
  { id: 2, title: "Build the API", done: false },
  { id: 3, title: "Test the API", done: false },
];

const openapi = {
  openapi: "3.0.3",
  info: { title: "Task API", version: "1.0.0" },
  servers: [{ url: `http://localhost:${port}` }],
  paths: {
    "/": { get: { summary: "Describe the API", responses: { 200: { description: "API metadata" } } } },
    "/health": { get: { summary: "Health check", responses: { 200: { description: "Healthy" } } } },
    "/tasks": {
      get: { summary: "List tasks", responses: { 200: { description: "Task list" } } },
      post: { summary: "Create a task", responses: { 201: { description: "Created" }, 400: { description: "Invalid title" } } },
    },
    "/tasks/{id}": {
      get: { summary: "Get one task", parameters: [{ "$ref": "#/components/parameters/TaskId" }], responses: { 200: { description: "Task" }, 404: { description: "Not found" } } },
      put: { summary: "Update a task", parameters: [{ "$ref": "#/components/parameters/TaskId" }], responses: { 200: { description: "Updated" }, 400: { description: "Invalid body" }, 404: { description: "Not found" } } },
      delete: { summary: "Delete a task", parameters: [{ "$ref": "#/components/parameters/TaskId" }], responses: { 204: { description: "Deleted" }, 404: { description: "Not found" } } },
    },
  },
  components: {
    parameters: { TaskId: { name: "id", in: "path", required: true, schema: { type: "integer" } } },
  },
};

function findTask(id) {
  return tasks.find((task) => task.id === Number(id));
}

function notFound(res, id) {
  return res.status(404).json({ error: `Task ${id} not found` });
}

app.get("/", (_req, res) => res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/tasks", (_req, res) => res.json(tasks));

app.get("/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  return task ? res.json(task) : notFound(res, req.params.id);
});

app.post("/tasks", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) return res.status(400).json({ error: "title is required" });

  const task = { id: Math.max(0, ...tasks.map(({ id }) => id)) + 1, title, done: false };
  tasks.push(task);
  return res.status(201).json(task);
});

app.put("/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return notFound(res, req.params.id);
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "request body must be an object" });
  }
  const { title, done } = req.body;
  if (title === undefined && done === undefined) return res.status(400).json({ error: "title or done is required" });
  if (title !== undefined && (typeof title !== "string" || !title.trim())) return res.status(400).json({ error: "title must be a non-empty string" });
  if (done !== undefined && typeof done !== "boolean") return res.status(400).json({ error: "done must be a boolean" });
  if (title !== undefined) task.title = title.trim();
  if (done !== undefined) task.done = done;
  return res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex((task) => task.id === Number(req.params.id));
  if (index === -1) return notFound(res, req.params.id);
  tasks.splice(index, 1);
  return res.status(204).send();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

export { app };
