import express from "express";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(process.env.DB_PATH || path.join(root, "jobs.db"));
const maxAttempts = Number(process.env.MAX_ATTEMPTS || 3);
db.exec("CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY, idempotency_key TEXT UNIQUE, payload TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, result TEXT, error TEXT, created_at TEXT NOT NULL, started_at TEXT, finished_at TEXT); CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY, job_id INTEGER NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL);");
const app = express(); app.use(express.json()); const queued = new Set(); const now = () => new Date().toISOString();
function publicJob(row) { return row && { id: row.id, status: row.status, attempts: row.attempts, result: row.result ? JSON.parse(row.result) : null, error: row.error, createdAt: row.created_at, startedAt: row.started_at, finishedAt: row.finished_at }; }
function analyze(text) { if (text.includes("[fail]")) throw Error("simulated upstream failure"); const words = text.trim() ? text.trim().split(" ").filter(Boolean) : []; return { summary: text.trim().slice(0, 120), wordCount: words.length }; }
function runJob(id) { const row = db.prepare("SELECT * FROM jobs WHERE id=?").get(id); if (!row || row.status === "completed" || row.status === "failed") return; const attempt = row.attempts + 1; db.prepare("UPDATE jobs SET status='running', attempts=?, started_at=? WHERE id=?").run(attempt, now(), id); try { const result = analyze(JSON.parse(row.payload).text); db.prepare("UPDATE jobs SET status='completed', result=?, finished_at=? WHERE id=?").run(JSON.stringify(result), now(), id); } catch (error) { if (attempt < maxAttempts) { db.prepare("UPDATE jobs SET status='retrying', error=? WHERE id=?").run(error.message, id); setTimeout(() => queueJob(id), 10); } else { db.prepare("UPDATE jobs SET status='failed', error=?, finished_at=? WHERE id=?").run(error.message, now(), id); db.prepare("INSERT INTO alerts (job_id, message, created_at) VALUES (?, ?, ?)").run(id, "Job failed after " + attempt + " attempts", now()); } } }
function queueJob(id) { if (queued.has(id)) return; queued.add(id); setImmediate(() => { try { runJob(id); } finally { queued.delete(id); } }); }
app.get("/health", (_req, res) => res.json({ status: "ok", activeJobs: queued.size }));
app.post("/jobs", (req, res) => { const text = req.body && req.body.text; if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "text is required" }); const key = typeof req.body.idempotencyKey === "string" && req.body.idempotencyKey.trim() ? req.body.idempotencyKey.trim() : null; const existing = key && db.prepare("SELECT * FROM jobs WHERE idempotency_key=?").get(key); if (existing) return res.status(200).json(publicJob(existing)); try { const result = db.prepare("INSERT INTO jobs (idempotency_key, payload, status, created_at) VALUES (?, ?, 'queued', ?)").run(key, JSON.stringify({ text }), now()); const id = Number(result.lastInsertRowid); queueJob(id); return res.status(202).json(publicJob(db.prepare("SELECT * FROM jobs WHERE id=?").get(id))); } catch (error) { return res.status(409).json({ error: error.message }); } });
app.get("/jobs/:id", (req, res) => { const row = db.prepare("SELECT * FROM jobs WHERE id=?").get(Number(req.params.id)); return row ? res.json(publicJob(row)) : res.status(404).json({ error: "job not found" }); });
app.get("/alerts", (_req, res) => res.json(db.prepare("SELECT * FROM alerts ORDER BY id DESC").all()));
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url); if (isMain) app.listen(process.env.PORT || 3000, () => console.log("BE-06 listening on " + (process.env.PORT || 3000)));
export { app, db, runJob };
