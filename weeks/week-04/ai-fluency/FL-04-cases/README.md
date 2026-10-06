# FL-04 — Cases That Speak for Themselves
## Voice card
Direct, practical, specific, calm, honest, no buzzwords.
## Audience and action
These cases are for a technical lead or engineering manager hiring a junior backend engineer. The action is simple: open a public repository and follow its README.
## Case 1 — A small CRUD API that stays understandable
**Problem.** A first backend service needs clear routes and predictable responses before more complicated features are added.
**What I did and decided.** I built a small Node.js API around a simple resource, validated input at the boundary, and added focused tests for normal and invalid paths. I chose a boring structure so a new reader can find the route, data shape, and test without a framework maze.
**What came of it.** The public BE-01 repository gives a visitor a small service they can run and inspect.
Repository: https://github.com/aayushmotwani-dev/flyrank-be-01-crud-api
## Case 2 — Background work that does not block the request
**Problem.** Slow work should not make the client wait, but accepting it is not enough: the client needs status, retries, and a clear failure signal.
**What I did and decided.** In BE-06 I made POST /jobs return 202, stored the job in SQLite, processed it in a worker, exposed status, deduplicated idempotency keys, retried a simulated upstream failure up to three times, and recorded a terminal alert. I wrote three tests around those paths because they are the parts a reviewer is most likely to question.
**What came of it.** npm test passes locally and the README explains the request-to-worker-to-status flow.
Repository: https://github.com/aayushmotwani-dev/flyrank-be-06-background-job
## Case 3 — A decision flow that can be edited and checked
**Problem.** A decision flow is easy to draw and easy to make ambiguous. The useful version needs explicit YES/NO branches, persistence, and loop protection.
**What I did and decided.** In BE-09 I built an editable React Flow graph with normalized branch labels, local save/load, JSON export, and an Inngest-backed workflow endpoint. I added tests for branch traversal, YES/NO normalization, and loop protection.
**What came of it.** The repository has a runnable build and focused tests that show the important decision behavior.
Repository: https://github.com/aayushmotwani-dev/flyrank-be-09-decision-flow
## Case 4 — A report that becomes a link
**Problem.** A report can take time and produce a large artifact. Returning it directly mixes computation, storage, and delivery.
**What I did and decided.** In BE-08 I aggregated SQLite sales data, created a report job, returned 202, stored the PDF artifact, exposed status and a download URL, and streamed the file from a separate endpoint.
**What came of it.** The API makes the artifact lifecycle visible: create, wait, inspect status, then download.
Repository: https://github.com/aayushmotwani-dev/flyrank-be-08-pdf-reports
## Bio and contact copy
I’m Aayush Motwani, a backend engineering intern building small services from clear requirements. I like the part where a vague feature becomes a few explicit routes, a data model, a test, and a README another person can follow. If you are hiring a junior backend engineer, open a repository above and run its README. GitHub profile: https://github.com/aayushmotwani-dev
## Before and after
**Generic AI line:** “I am a results-driven backend developer passionate about scalable, innovative solutions.”
**My edited version:** “I build small backend services from clear requirements, then leave enough tests and explanation for another engineer to run and question the result.”
The edited version names the work, avoids a scale claim I cannot prove, and points at the one action: open a repository and follow its README.
