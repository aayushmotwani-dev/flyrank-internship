import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createApp } from "./server.js";

const request = (server, method, route, body, token) => new Promise((resolve, reject) => {
  const data = body ? JSON.stringify(body) : null;
  const req = http.request({ port: server.address().port, method, path: route, headers: { ...(data ? { "content-type": "application/json", "content-length": Buffer.byteLength(data) } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) } }, (res) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
  });
  req.on("error", reject);
  if (data) req.write(data);
  req.end();
});

test("auth, database, cache, background report, and PDF download work together", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flyrank-capstone-"));
  const { app, db } = createApp({ dbPath: path.join(dir, "test.db"), reportsDir: dir, secret: "test-secret" });
  const server = http.createServer((req, res) => app(req, res));
  await new Promise((resolve) => server.listen(0, resolve));
  try {
    const registered = await request(server, "POST", "/api/auth/register", { email: "aayush@example.com", password: "correct-horse" });
    assert.equal(registered.status, 201);
    const { token } = JSON.parse(registered.body);
    assert.equal((await request(server, "GET", "/api/projects", null, token)).status, 200);
    const project = await request(server, "POST", "/api/projects", { name: "Evidence hub", description: "A small place to track backend proof." }, token);
    assert.equal(project.status, 201);
    const projectId = JSON.parse(project.body).id;
    const queued = await request(server, "POST", `/api/projects/${projectId}/reports`, null, token);
    assert.equal(queued.status, 202);
    const jobId = JSON.parse(queued.body).jobId;
    let job;
    for (let i = 0; i < 20; i++) {
      job = await request(server, "GET", `/api/jobs/${jobId}`, null, token);
      if (JSON.parse(job.body).status === "completed") break;
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    const jobBody = JSON.parse(job.body);
    assert.equal(jobBody.status, "completed");
    const pdf = await request(server, "GET", `/api/jobs/${jobId}/download`, null, token);
    assert.equal(pdf.status, 200);
    assert.equal(pdf.headers["content-type"], "application/pdf");
    assert.match(pdf.body.toString("ascii", 0, 8), /^%PDF-1\.4/);
  } finally {
    server.close();
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
