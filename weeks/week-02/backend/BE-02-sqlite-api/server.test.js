import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const dir = await mkdtemp(path.join(os.tmpdir(), "be-02-"));
process.env.DB_PATH = path.join(dir, "tasks.db");
const { app, db } = await import("./server.js");

test("CRUD persists in SQLite", async () => {
  const server = app.listen(0);
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    assert.equal((await fetch(base + "/tasks")).status, 200);
    const createdResponse = await fetch(base + "/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Persist me" }) });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();
    assert.equal((await fetch(base + "/tasks/" + created.id, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ done: true }) })).status, 200);
    assert.equal((await fetch(base + "/tasks/999")).status, 404);
    assert.equal((await fetch(base + "/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status, 400);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE title = ?").get("Persist me").count, 1);
  } finally {
    server.close();
    db.close();
    await rm(dir, { recursive: true, force: true });
  }
});
