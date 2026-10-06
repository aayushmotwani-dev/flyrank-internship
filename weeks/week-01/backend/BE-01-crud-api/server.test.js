import assert from "node:assert/strict";
import test from "node:test";
import { app } from "./server.js";

test("CRUD endpoints return the required status codes", async () => {
  const server = app.listen(0);
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    assert.equal((await fetch(base + "/health")).status, 200);
    assert.equal((await fetch(base + "/docs")).status, 200);
    const createdResponse = await fetch(base + "/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Buy milk" }),
    });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();
    assert.equal((await fetch(base + "/tasks/" + created.id)).status, 200);
    assert.equal((await fetch(base + "/tasks/" + created.id, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ done: true }),
    })).status, 200);
    assert.equal((await fetch(base + "/tasks/" + created.id, { method: "DELETE" })).status, 204);
    assert.equal((await fetch(base + "/tasks/999")).status, 404);
    assert.equal((await fetch(base + "/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status, 400);
  } finally {
    server.close();
  }
});
