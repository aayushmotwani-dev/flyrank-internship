import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test, after } from "node:test";
const root = fs.mkdtempSync(path.join(os.tmpdir(), "be08-"));
process.env.DB_PATH = path.join(root, "reports.db");
process.env.REPORTS_DIR = path.join(root, "reports");
const { app, db } = await import("./server.js?test=" + Date.now());
const server = app.listen(0); const base = "http://127.0.0.1:" + server.address().port;
async function request(route, options) { const response = await fetch(base + route, options); const body = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.arrayBuffer(); return { response, body }; }
test("aggregates seeded sales", async () => { const result = await request("/summary"); assert.equal(result.response.status, 200); assert.equal(result.body.count, 4); assert.equal(result.body.totalCents, 47800); });
test("queues and serves a PDF", async () => { const created = await request("/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fromDate: "2026-10-02", toDate: "2026-10-04" }) }); assert.equal(created.response.status, 202); for (let i = 0; i < 20; i++) { await new Promise(resolve => setTimeout(resolve, 5)); const status = await request("/reports/" + created.body.id); if (status.body.status === "completed") { const file = await request(status.body.downloadUrl); assert.equal(file.response.status, 200); assert.equal(Buffer.from(file.body).subarray(0, 8).toString(), "%PDF-1.4"); return; } } assert.fail("report did not complete"); });
test("rejects reversed dates", async () => { const result = await request("/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fromDate: "2026-10-05", toDate: "2026-10-01" }) }); assert.equal(result.response.status, 400); });
after(() => { server.close(); db.close(); fs.rmSync(root, { recursive: true, force: true }); });
