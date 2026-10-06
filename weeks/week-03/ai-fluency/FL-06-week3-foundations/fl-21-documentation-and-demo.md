# FL-09 — documentation and demo evidence

## What the agent does

The personal agent turns a backend assignment brief into a small, checkable implementation plan. It asks for the audience, endpoint flow, data model, failure cases, and tests instead of generating a vague feature list. The same evidence hub can then store a project, queue a report job, poll its status, and download a PDF report.

## Reproduce it

1. Open the public capstone README: https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations/blob/main/capstone-10x-README.md
2. Copy the five prefixed capstone files into a new folder using the filenames shown in the README.
3. Run `npm test` with Node 24. The test registers a user, authenticates, creates a project, requests a report, polls the background job, and checks the PDF response.
4. Read the personal-agent spec and build log for the prompt, tools, guardrails, and evaluation cases.

## Architecture sketch

`HTTP client → auth + validation → SQLite users/projects/jobs → setImmediate worker → PDF bytes`

The API returns `202 Accepted` for report creation, a worker changes the job to `succeeded` or `failed`, and the authenticated download endpoint returns the generated PDF. The small cache is per user and is invalidated after project writes.

## Evaluation and limitations

- The local integration test passed 1/1 and the source passed `node --check`.
- The test covers registration, password hashing/authentication, authenticated project creation and listing, a queued report job, completion polling, and a PDF download.
- The project is intentionally a stdlib-only learning capstone. It is not a production multi-process queue, has no external email provider, and uses a short in-memory cache.
- I used an AI tool for brainstorming and review; I kept the implementation, ran the checks, and recorded the limits myself.

## Demo status

The public portfolio has a live, safe, client-side capstone-flow demo: https://aayushmotwani-dev.github.io/flyrank-fl-07-blank-live/

I have not attached a 3–5 minute narrated screen recording because a real recording was not made in this pass. I am submitting the README and live demo honestly; the video remains a revise item rather than using a fake or unrecorded link.
