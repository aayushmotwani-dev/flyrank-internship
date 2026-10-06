# FlyRank BE-08 — PDF Report Generator

A small backend report pipeline that aggregates sales data in SQLite, queues report generation as an on-demand background job, stores the finished PDF artifact, and exposes a download URL.

## Run


a npm install

npm test

npm start

The service listens on http://localhost:3000.

## API flow

- GET /summary runs the SQL aggregation.
- POST /reports returns 202 with a report id and queues the job.
- GET /reports/:id is the status endpoint.
- GET /reports/:id/download streams the stored PDF.

The demo stores report metadata in SQLite and PDF files in reports/. A durable queue/worker would be the next production step for multi-instance workloads.
