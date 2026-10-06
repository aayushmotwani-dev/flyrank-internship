import assert from "node:assert/strict";
import test from "node:test";

const base = process.env.BASE_URL ?? "http://localhost:3001";

test("containerized API exposes the CRUD contract", async () => {
  assert.equal((await fetch(base + "/health")).status, 200);
  assert.equal((await fetch(base + "/tasks")).status, 200);
  const createdResponse = await fetch(base + "/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Container check" }) });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  assert.equal((await fetch(base + "/tasks/" + created.id, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ done: true }) })).status, 200);
  assert.equal((await fetch(base + "/tasks/999999")).status, 404);
  assert.equal((await fetch(base + "/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status, 400);
  assert.equal((await fetch(base + "/tasks/" + created.id, { method: "DELETE" })).status, 204);
});
