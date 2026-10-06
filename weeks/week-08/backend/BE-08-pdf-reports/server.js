import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import express from "express";

const root = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(process.env.DB_PATH || path.join(root, "reports.db"));
const reportsDir = process.env.REPORTS_DIR || path.join(root, "reports");
fs.mkdirSync(reportsDir, { recursive: true });
db.exec("CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, customer TEXT NOT NULL, amount_cents INTEGER NOT NULL, sold_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY, status TEXT NOT NULL, from_date TEXT, to_date TEXT, row_count INTEGER, file_name TEXT, error TEXT, created_at TEXT NOT NULL, completed_at TEXT);");
if (db.prepare("SELECT COUNT(*) AS count FROM sales").get().count === 0) {
  const add = db.prepare("INSERT INTO sales (customer, amount_cents, sold_at) VALUES (?, ?, ?)");
  [["Acme GmbH", 12900, "2026-10-01"], ["Northwind", 8900, "2026-10-02"], ["Acme GmbH", 4500, "2026-10-03"], ["Contoso", 21500, "2026-10-04"]].forEach(row => add.run(...row));
}
const app = express(); app.use(express.json()); const jobs = new Set();
const now = () => new Date().toISOString();
function validDate(value) { return value == null || typeof value === "string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(value); }
function filters(input = {}) { const fromDate = input.fromDate || null, toDate = input.toDate || null; if (!validDate(fromDate) || !validDate(toDate)) throw Error("dates must use YYYY-MM-DD"); if (fromDate && toDate && fromDate > toDate) throw Error("fromDate must be before toDate"); return { fromDate, toDate }; }
function aggregate(range) { const values = [], where = []; if (range.fromDate) { values.push(range.fromDate); where.push("sold_at >= ?"); } if (range.toDate) { values.push(range.toDate); where.push("sold_at <= ?"); } const clause = where.length ? " WHERE " + where.join(" AND ") : ""; const summary = db.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(amount_cents), 0) AS total_cents FROM sales" + clause).get(...values); const rows = db.prepare("SELECT customer, amount_cents, sold_at FROM sales" + clause + " ORDER BY sold_at, id").all(...values); return { count: Number(summary.count), totalCents: Number(summary.total_cents), rows }; }
function pdf(lines) { const esc = value => String(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)"); const stream = ["BT", "/F1 12 Tf", "50 760 Td", "(" + esc(lines[0]) + ") Tj", "ET"].join("\\n"); const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Length " + Buffer.byteLength(stream) + " >>\\nstream\\n" + stream + "\\nendstream"]; let output = "%PDF-1.4\\n", offsets = [0]; objects.forEach((object, index) => { offsets.push(Buffer.byteLength(output)); output += (index + 1) + " 0 obj\\n" + object + "\\nendobj\\n"; }); const start = Buffer.byteLength(output); output += "xref\\n0 6\\n0000000000 65535 f \\n"; offsets.slice(1).forEach(offset => { output += String(offset).padStart(10, "0") + " 00000 n \\n"; }); output += "trailer\\n<< /Size 6 /Root 1 0 R >>\\nstartxref\\n" + start + "\\n%%EOF\\n"; return Buffer.from(output, "ascii"); }
function publicReport(row) { return row && { id: row.id, status: row.status, fromDate: row.from_date, toDate: row.to_date, rowCount: row.row_count, createdAt: row.created_at, completedAt: row.completed_at, downloadUrl: row.status === "completed" ? "/reports/" + row.id + "/download" : null, error: row.error }; }
function runJob(id, range) { db.prepare("UPDATE reports SET status='running' WHERE id=?").run(id); try { const result = aggregate(range), fileName = "report-" + id + ".pdf"; fs.writeFileSync(path.join(reportsDir, fileName), pdf(["FlyRank Sales Report", "Rows: " + result.count, "Total cents: " + result.totalCents])); db.prepare("UPDATE reports SET status='completed', row_count=?, file_name=?, completed_at=? WHERE id=?").run(result.count, fileName, now(), id); } catch (error) { db.prepare("UPDATE reports SET status='failed', error=?, completed_at=? WHERE id=?").run(error.message, now(), id); } }
function queue(id, range) { jobs.add(id); setImmediate(() => { try { runJob(id, range); } finally { jobs.delete(id); } }); }
app.get("/", (_req, res) => res.json({ name: "PDF report generator", version: "1.0.0" }));
app.get("/health", (_req, res) => res.json({ status: "ok", activeJobs: jobs.size }));
app.get("/summary", (req, res) => { try { res.json(aggregate(filters(req.query))); } catch (error) { res.status(400).json({ error: error.message }); } });
app.get("/reports", (_req, res) => res.json(db.prepare("SELECT * FROM reports ORDER BY id DESC").all().map(publicReport)));
app.post("/reports", (req, res) => { try { const range = filters(req.body), created = now(), result = db.prepare("INSERT INTO reports (status, from_date, to_date, created_at) VALUES ('queued', ?, ?, ?)").run(range.fromDate, range.toDate, created), id = Number(result.lastInsertRowid); queue(id, range); res.status(202).json(publicReport(db.prepare("SELECT * FROM reports WHERE id=?").get(id))); } catch (error) { res.status(400).json({ error: error.message }); } });
app.get("/reports/:id/download", (req, res) => { const report = db.prepare("SELECT * FROM reports WHERE id=?").get(Number(req.params.id)); if (!report) return res.status(404).json({ error: "report not found" }); if (report.status !== "completed") return res.status(409).json({ error: "report is " + report.status }); return res.download(path.join(reportsDir, report.file_name), report.file_name); });
app.get("/reports/:id", (req, res) => { const report = db.prepare("SELECT * FROM reports WHERE id=?").get(Number(req.params.id)); res.status(report ? 200 : 404).json(report ? publicReport(report) : { error: "report not found" }); });
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url); if (isMain) app.listen(process.env.PORT || 3000, () => console.log("BE-08 listening on " + (process.env.PORT || 3000)));
export { app, db, aggregate, pdf, runJob };
