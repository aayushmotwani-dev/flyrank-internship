import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const now = () => new Date().toISOString();
const json = (res, status, value) => {
  const body = JSON.stringify(value);
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(body) });
  res.end(body);
};
const readBody = async (req) => {
  let text = "";
  for await (const chunk of req) text += chunk;
  if (!text) return {};
  try { return JSON.parse(text); } catch { throw new Error("body must be valid JSON"); }
};
const passwordHash = (password, salt = crypto.randomBytes(16).toString("hex")) => `${salt}:${crypto.scryptSync(password, salt, 32).toString("hex")}`;
const passwordMatches = (password, stored) => {
  const [salt, expected] = String(stored).split(":");
  const actual = crypto.scryptSync(password, salt, 32).toString("hex");
  return expected && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
};
const tokenFor = (userId, secret) => {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 86_400_000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};
const userFromToken = (req, db, secret) => {
  const value = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!value) return null;
  const [payload, signature] = value.split(".");
  const expected = crypto.createHmac("sha256", secret).update(payload ?? "").digest("base64url");
  if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (data.exp < Date.now()) return null;
  return db.prepare("SELECT id, email FROM users WHERE id = ?").get(data.userId) ?? null;
};
const pdfText = (value) => String(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
const makePdf = (lines) => {
  const content = ["BT", "/F1 18 Tf", "50 760 Td", `(${pdfText(lines[0])}) Tj`, "/F1 10 Tf"];
  for (const line of lines.slice(1)) content.push("0 -18 Td", `(${pdfText(line)}) Tj`);
  content.push("ET");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content.join("\n"))} >>\nstream\n${content.join("\n")}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
};

export function createApp({ dbPath = path.join(root, "capstone.db"), reportsDir = path.join(root, "reports"), secret = "development-secret", simulateFailure = false } = {}) {
  fs.mkdirSync(reportsDir, { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, project_id INTEGER NOT NULL, status TEXT NOT NULL, file_name TEXT, error TEXT, created_at TEXT NOT NULL, completed_at TEXT);
  `);
  const cache = new Map();
  const invalidate = (userId) => cache.delete(userId);
  const listProjects = (userId) => {
    const cached = cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const value = db.prepare("SELECT id, name, description, created_at AS createdAt FROM projects WHERE user_id = ? ORDER BY id DESC").all(userId);
    cache.set(userId, { value, expiresAt: Date.now() + 5000 });
    return value;
  };
  const startReport = (jobId, userId, projectId) => {
    setImmediate(() => {
      db.prepare("UPDATE jobs SET status = 'running' WHERE id = ?").run(jobId);
      try {
        if (simulateFailure) throw new Error("simulated report failure");
        const project = db.prepare("SELECT name, description FROM projects WHERE id = ? AND user_id = ?").get(projectId, userId);
        if (!project) throw new Error("project not found");
        const fileName = `project-${projectId}-report-${jobId}.pdf`;
        const pdf = makePdf(["FlyRank 10x Solution Report", `Project: ${project.name}`, `Created: ${now()}`, "", project.description]);
        fs.writeFileSync(path.join(reportsDir, fileName), pdf);
        db.prepare("UPDATE jobs SET status = 'completed', file_name = ?, completed_at = ? WHERE id = ?").run(fileName, now(), jobId);
      } catch (error) {
        db.prepare("UPDATE jobs SET status = 'failed', error = ?, completed_at = ? WHERE id = ?").run(error.message, now(), jobId);
      }
    });
  };
  const app = async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { status: "ok", service: "flyrank-capstone-10x" });
    if (req.method === "GET" && url.pathname === "/") return json(res, 200, { name: "FlyRank 10x Solution", concepts: ["api", "database", "authentication", "background jobs", "pdf reporting", "cache"] });
    try {
      if (req.method === "POST" && url.pathname === "/api/auth/register") {
        const body = await readBody(req);
        if (typeof body.email !== "string" || typeof body.password !== "string" || body.password.length < 8) return json(res, 400, { error: "email and a password of at least 8 characters are required" });
        const result = db.prepare("INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)").run(body.email.toLowerCase(), passwordHash(body.password), now());
        const userId = Number(result.lastInsertRowid);
        return json(res, 201, { user: { id: userId, email: body.email.toLowerCase() }, token: tokenFor(userId, secret) });
      }
      if (req.method === "POST" && url.pathname === "/api/auth/login") {
        const body = await readBody(req);
        const user = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(String(body.email ?? "").toLowerCase());
        if (!user || !passwordMatches(String(body.password ?? ""), user.password_hash)) return json(res, 401, { error: "invalid credentials" });
        return json(res, 200, { user: { id: user.id, email: user.email }, token: tokenFor(user.id, secret) });
      }
      const user = userFromToken(req, db, secret);
      if (!user) return json(res, 401, { error: "authentication required" });
      if (req.method === "GET" && url.pathname === "/api/projects") return json(res, 200, { projects: listProjects(user.id), cachedForMs: 5000 });
      if (req.method === "POST" && url.pathname === "/api/projects") {
        const body = await readBody(req);
        if (!body.name || !body.description) return json(res, 400, { error: "name and description are required" });
        const result = db.prepare("INSERT INTO projects (user_id, name, description, created_at) VALUES (?, ?, ?, ?)").run(user.id, body.name, body.description, now());
        invalidate(user.id);
        return json(res, 201, { id: Number(result.lastInsertRowid), name: body.name, description: body.description });
      }
      const reportMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/reports$/);
      if (req.method === "POST" && reportMatch) {
        const projectId = Number(reportMatch[1]);
        if (!db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(projectId, user.id)) return json(res, 404, { error: "project not found" });
        const result = db.prepare("INSERT INTO jobs (user_id, project_id, status, created_at) VALUES (?, ?, 'queued', ?)").run(user.id, projectId, now());
        const jobId = Number(result.lastInsertRowid);
        startReport(jobId, user.id, projectId);
        return json(res, 202, { jobId, status: "queued" });
      }
      const jobMatch = url.pathname.match(/^\/api\/jobs\/(\d+)$/);
      if (req.method === "GET" && jobMatch) {
        const job = db.prepare("SELECT id, status, file_name AS fileName, error, created_at AS createdAt, completed_at AS completedAt FROM jobs WHERE id = ? AND user_id = ?").get(Number(jobMatch[1]), user.id);
        return job ? json(res, 200, { ...job, downloadUrl: job.status === "completed" ? `/api/jobs/${job.id}/download` : null }) : json(res, 404, { error: "job not found" });
      }
      const downloadMatch = url.pathname.match(/^\/api\/jobs\/(\d+)\/download$/);
      if (req.method === "GET" && downloadMatch) {
        const job = db.prepare("SELECT file_name AS fileName FROM jobs WHERE id = ? AND user_id = ? AND status = 'completed'").get(Number(downloadMatch[1]), user.id);
        if (!job) return json(res, 404, { error: "completed report not found" });
        const file = fs.readFileSync(path.join(reportsDir, job.fileName));
        res.writeHead(200, { "content-type": "application/pdf", "content-length": file.length, "content-disposition": `attachment; filename="${job.fileName}"` });
        return res.end(file);
      }
      return json(res, 404, { error: "not found" });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return json(res, 409, { error: "email already registered" });
      return json(res, 400, { error: error.message });
    }
  };
  return { app, db };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { app } = createApp({ secret: process.env.AUTH_SECRET ?? "local-dev-secret" });
  http.createServer((req, res) => app(req, res)).listen(process.env.PORT ?? 3000, () => console.log(`capstone listening on ${process.env.PORT ?? 3000}`));
}

export { makePdf };
