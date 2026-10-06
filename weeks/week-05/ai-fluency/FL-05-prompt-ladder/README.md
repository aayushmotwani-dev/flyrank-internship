# FL-05 — The Prompt Ladder

This document shows one prompt changing one layer at a time for a real backend task: designing the FlyRank BE-06 background-job API. The point was to compare outputs, not just make the prompt sound better.

## The task

Ask for a practical design for an API that accepts slow work, returns quickly, and lets a caller check the result later.

## Run 0 — genuinely weak baseline

Prompt: Write backend code for a background job.

Representative output: Use a queue such as BullMQ, create a worker, and expose a status endpoint. The worker processes jobs asynchronously.

Notes:
- What changed: Nothing; this is the intentionally weak starting point.
- What improved in the output: It named the general pattern, so I had a starting vocabulary.
- What still failed: It did not define the API, persistence, failure behaviour, or what quickly means.
- What I would try next: State the result the design must produce.

## Run 1 — one layer: clearer goal

Prompt: Design a small backend API that accepts a slow text-processing job immediately and lets the caller check its eventual result.

Representative output: POST /jobs accepts work and returns 202 Accepted with a job id. GET /jobs/:id returns queued, running, completed, or failed, plus the result when complete.

Notes:
- What changed: Added only a clear goal.
- What improved in the output: The answer moved from a generic queue description to two concrete API responsibilities and a useful 202 response.
- What still failed: It still assumed the reader knew who the API was for and how the job should behave after retries.
- What I would try next: Name the audience.

## Run 2 — one layer: defined audience

Prompt: Design a small backend API that accepts a slow text-processing job immediately and lets the caller check its eventual result. Explain it to a junior backend engineer joining a small product team.

Representative output: The caller should not hold an HTTP request open while the worker runs. First return a job id; then poll the status resource. Keep the first version simple: one process can contain the API and worker.

Notes:
- What changed: Added only the audience.
- What improved in the output: The explanation used the request-lifecycle problem as its starting point and made the single-process trade-off understandable.
- What still failed: It became more tutorial-like but still omitted the data shape and duplicate-request behaviour. This layer helped clarity more than completeness.
- What I would try next: Add the real project context.

## Run 3 — one layer: real context

Prompt: Design a small backend API that accepts a slow text-processing job immediately and lets the caller check its eventual result. Explain it to a junior backend engineer joining a small product team. This is for FlyRank BE-06: use SQLite, keep the API and worker in one Node.js process, simulate slow work locally, and make repeated requests safe with an idempotency key.

Representative output: Store a job row with a unique idempotency_key. On a duplicate key, return the existing job instead of creating another row. A worker can use setImmediate for the local background boundary and update the row from queued to running to completed or failed.

Notes:
- What changed: Added only the project context and constraints already present in BE-06.
- What improved in the output: The answer became implementable: it selected SQLite fields, a local worker boundary, and duplicate-request handling instead of suggesting an abstract queue product.
- What still failed: The important requirements were present but buried in prose, making the answer harder to turn into a checklist.
- What I would try next: Request a specific output format.

## Run 4 — one layer: specified output format

Prompt: Design a small backend API that accepts a slow text-processing job immediately and lets the caller check its eventual result. Explain it to a junior backend engineer joining a small product team. This is for FlyRank BE-06: use SQLite, keep the API and worker in one Node.js process, simulate slow work locally, and make repeated requests safe with an idempotency key. Return exactly these sections: API contract, job state model, worker flow, and test cases.

Representative output: API contract — POST /jobs returns 202 and { id, status }; GET /jobs/:id returns status, attempts, result, and error. Job state model — queued to running to completed; failures enter retrying and finally failed. Worker flow — claim the row, process once, update it, retry bounded failures, and alert on terminal failure. Test cases — fast acceptance, eventual completion, duplicate idempotency key, and terminal failure alert.

Notes:
- What changed: Added only the required section structure.
- What improved in the output: The same design became scannable and produced a direct test checklist rather than another paragraph.
- What still failed: The format made it easy to overstate guarantees; it did not yet ask the reviewer to challenge unsafe assumptions.
- What I would try next: Add one verification requirement.

## Run 5 — one layer: verification requirement

Prompt: Design a small backend API that accepts a slow text-processing job immediately and lets the caller check its eventual result. Explain it to a junior backend engineer joining a small product team. This is for FlyRank BE-06: use SQLite, keep the API and worker in one Node.js process, simulate slow work locally, and make repeated requests safe with an idempotency key. Return exactly these sections: API contract, job state model, worker flow, and test cases. For every claimed behaviour, include the smallest test that would prove it; flag any assumption that is not verified locally.

Representative output: API contract — POST /jobs returns 202 for a new idempotency key and a stable job id; test that the response arrives before background completion. Job state model — retries are bounded at three attempts; test a simulated upstream failure and confirm a terminal alert. Worker flow — a duplicate key reuses the existing row; test that the row count stays at one. Assumption to verify — setImmediate is only a local background boundary, not a durable process queue; test behaviour after a process restart before calling it production-durable.

Notes:
- What changed: Added only a verification requirement.
- What improved in the output: Each important claim gained a concrete check, and the answer separated the locally verified worker boundary from a durable queue guarantee.
- What still failed: It still did not specify the exact database schema or production queue choice; those are outside this small assignment and should not be invented.
- What I would try next: Reuse the final prompt for another background task and check whether a stranger can follow it without this document.

## Side-by-side result

| Run | Single added layer | Main output improvement |
| --- | --- | --- |
| 0 | Weak baseline | Named a generic asynchronous pattern only |
| 1 | Clear goal | Produced a concrete accept/status API shape |
| 2 | Audience | Explained the request-lifecycle trade-off plainly |
| 3 | Context | Chose SQLite, a local worker boundary, and idempotency |
| 4 | Output format | Turned prose into a design and test checklist |
| 5 | Verification requirement | Attached a smallest proving test to each claim |

The audience layer improved tone and teaching value, but by itself it did not add much technical completeness. That was useful evidence: not every prompt layer earns a permanent place for the same reason.

## Final reusable prompt

Design a small backend API for a slow operation that must be accepted immediately and checked later. Explain it to a junior backend engineer on a small product team. Use the real project context I provide, and do not introduce infrastructure that the context does not require. Return exactly these sections: API contract, state model, worker flow, and test cases. For every claimed behaviour, include the smallest test that would prove it, and label assumptions that have not been verified locally. Prefer a simple implementation that is safe at the HTTP boundary, handles duplicate requests predictably, bounds retries, and reports terminal failure.

## What I learned

The largest jump came from context and verification, not from adding more polite wording. A good final prompt gives a stranger enough context to make the same small, testable decision while still forcing the answer to admit what it has not proved.
