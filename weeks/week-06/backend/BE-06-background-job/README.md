# FlyRank BE-06 — Your First Background Job

A SQLite-backed worker pattern for slow work: the API accepts a text-analysis job and returns 202 immediately, a worker processes it, and a status endpoint reports the result.

## Run

npm install
npm test
npm start

## API

- POST /jobs with { "text": "hello", "idempotencyKey": "demo-1" } queues work.
- GET /jobs/:id reports queued, running, retrying, completed, or failed.
- GET /alerts lists terminal failures that need attention.

The worker retries failures up to MAX_ATTEMPTS. Reusing an idempotency key returns the existing job instead of doing the work twice.
