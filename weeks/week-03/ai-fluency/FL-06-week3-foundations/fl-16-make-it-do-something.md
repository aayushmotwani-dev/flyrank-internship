# Make It Do Something

## The one feature

I added one small live demo to the public portfolio shell: **Show one capstone flow**. Pressing the button reveals a readable request/response trace for the 10x evidence-hub capstone:

```text
POST /api/projects/1/reports
→ 202 Accepted { jobId: "job-42" }

GET /api/jobs/job-42
→ completed { report: "evidence-summary.pdf" }
```

This is intentionally a demo of the real flow, not a fake claim that the static site is running the backend. The production-like API is verified locally in the capstone project; the public page makes the important interaction understandable without needing credentials.

## Plain-words data flow

A backend is the part of an application that receives requests, checks them, stores or processes data, and sends a result back. In the real capstone, the first request creates a report job and returns `202 Accepted` with a job ID. A worker then processes the job. The browser can ask for that job ID later and see whether it is still running or has finished. When it finishes, the report can be downloaded.

The live portfolio demo does not send data anywhere. It only reveals the same flow in the browser, so it is safe to test publicly. That is the limit I want a reviewer to see clearly.

## Checks

- Open the public HTTPS URL while logged out.
- Press the button once and confirm the flow appears.
- Confirm the button and output remain readable on a narrow viewport.
