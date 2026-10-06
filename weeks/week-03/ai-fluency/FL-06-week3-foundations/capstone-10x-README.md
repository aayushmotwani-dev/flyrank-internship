# My 10x Solution — Aayush Motwani

## Problem

My backend work is spread across separate small assignments. The evidence exists, but it is harder to follow as one coherent system. This capstone is a small authenticated evidence hub: a user can save project notes, request a report, check the background job, and download a PDF summary.

## What is implemented

- API endpoints for registration, login, projects, report jobs, and downloads.
- SQLite persistence using Node's built-in `node:sqlite` module.
- Password hashing with `scrypt` and signed bearer tokens with HMAC.
- A background worker that accepts report work with `202`, tracks queued/running/completed/failed states, and writes the PDF.
- A small five-second project-list cache that is invalidated after a write.
- A dependency-free PDF writer for the report output.

This intentionally reuses the useful ideas from BE-02, BE-03, BE-06, and BE-08, but joins them into one small flow rather than pretending the capstone is a production SaaS product.

## Flow

`register/login -> create project -> POST report -> 202 job id -> poll status -> download PDF`

## Concepts covered

| Program concept | Where it appears |
| --- | --- |
| API endpoints | `server.js` HTTP routes |
| Database | SQLite users, projects, and jobs tables |
| Authentication | scrypt password hashes and signed bearer tokens |
| Background job | `startReport` and job status transitions |
| Reporting | generated PDF download |
| Caching | five-second per-user project-list cache |

## Run and verify

Requirements: Node 22+ (tested with Node 24.19).

```bash
npm test
npm start
```

Register a user, log in, create a project, then request `/api/projects/:id/reports` with the bearer token. The endpoint returns `202` and a job id. Poll `/api/jobs/:id` until it is `completed`, then GET the returned download URL.

The test covers the full path: authentication, persistence, project creation, the `202` background job, completion polling, PDF content type, and the PDF header. It also keeps the failure state visible instead of hiding worker errors.

## Scope and honest limits

This is a small capstone, not a production deployment. Tokens are short-lived and the secret must be supplied through `AUTH_SECRET` outside local development. The worker runs in the process, so a multi-instance deployment would need a durable queue and worker lease. The cache is intentionally local and short-lived. Those are deliberate ceilings for a finishable free-tool project.

