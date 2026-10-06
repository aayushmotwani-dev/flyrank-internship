import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test, after } from "node:test";
const root = fs.mkdtempSync(path.join(os.tmpdir(), "be06-")); process.env.DB_PATH = path.join(root, "jobs.db");
const { app, db } = await import("./server.js?test=" + Date.now()); const server = app.listen(0); const base = "http://127.0.0.1:" + server.address().port;
const request = (route, options) => fetch(base + route, options).then(async response => ({ response, body: await response.json() }));
async function waitFor(id) { for (let i = 0; i < 30; i++) { const result = await request("/jobs/" + id); if (["completed", "failed"].includes(result.body.status)) return result.body; await new Promise(resolve => setTimeout(resolve, 5)); } throw Error("job did not finish"); }
test("returns 202 and completes work", async () => { const created = await request("/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "hello from a worker", idempotencyKey: "one" }) }); assert.equal(created.response.status, 202); const finished = await waitFor(created.body.id); assert.equal(finished.status, "completed"); assert.equal(finished.result.wordCount, 4); });
test("deduplicates an idempotent request", async () => { const body = JSON.stringify({ text: "same job", idempotencyKey: "same" }); const first = await request("/jobs", { method: "POST", headers: { "content-type": "application/json" }, body }); const second = await request("/jobs", { method: "POST", headers: { "content-type": "application/json" }, body }); assert.equal(first.body.id, second.body.id); assert.equal(second.response.status, 200); });
test("retries and alerts after failure", async () => { const created = await request("/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "[fail]" }) }); const finished = await waitFor(created.body.id); assert.equal(finished.status, "failed"); assert.equal(finished.attempts, 3); const alerts = await request("/alerts"); assert.equal(alerts.body[0].job_id, created.body.id); });
after(() => { server.close(); db.close(); fs.rmSync(root, { recursive: true, force: true }); });
