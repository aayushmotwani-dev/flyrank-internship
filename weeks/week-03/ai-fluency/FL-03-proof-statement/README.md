# FL-03 — What I Am Proving

## Proof statement

I can implement reliable asynchronous job handling from a clear backend brief. For a technical lead or engineering manager at a small product team hiring a junior backend engineer, the proof is the public [BE-06 background-job repository](https://github.com/aayushmotwani-dev/flyrank-be-06-background-job): they can run its README test command and verify that a request returns `202`, work completes in the background, duplicate idempotency keys do not create duplicate jobs, and terminal failures retry and create an alert.

## Why this needs to exist

A CV or LinkedIn profile can list Node.js, SQLite, or background jobs, but it cannot show whether I can implement the request-to-worker-to-status flow and handle retries and duplicate requests correctly.

## How I narrowed it

I used Claude as a thinking partner in a project chat rather than asking it to invent a claim. The interview pushed back on my first broad version and asked me to choose one skill, name the exact evidence, confirm the repository was public, and choose one visitor action.

- [Claude interview chat](https://claude.ai/chat/52514372-20c2-4642-b5d2-0c73364e5631)
- [BE-06 repository](https://github.com/aayushmotwani-dev/flyrank-be-06-background-job)

The final choices are:

- Primary skill: reliable asynchronous job handling.
- Specific audience: a technical lead or engineering manager at a small product team hiring a junior backend engineer.
- One action: run the README test command in the public BE-06 repository.

## Evidence named in the interview

The repository has three focused tests:

1. A new job returns `202` and completes in the background.
2. Reusing an idempotency key returns the same job instead of creating a second one.
3. A simulated upstream failure retries up to three attempts and creates a terminal alert.

The README takes a visitor from clone to a passing test run with `npm install` followed by `npm test`.
