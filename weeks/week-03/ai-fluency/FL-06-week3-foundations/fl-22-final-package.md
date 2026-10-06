# AI Fluency final package — Aayush Motwani

## One-place index

### Backend proof

- BE-01 CRUD API: https://github.com/aayushmotwani-dev/flyrank-be-01-crud-api
- BE-02 SQLite API: https://github.com/aayushmotwani-dev/flyrank-be-02-sqlite-api
- BE-03 Auth API: https://github.com/aayushmotwani-dev/flyrank-be-03-auth-api
- BE-04 Containerized API: https://github.com/aayushmotwani-dev/flyrank-be-04-containerized-api
- BE-05 Polite scraper: https://github.com/aayushmotwani-dev/flyrank-be-05-polite-scraper
- BE-06 Background job: https://github.com/aayushmotwani-dev/flyrank-be-06-background-job
- BE-07 AI API: https://github.com/aayushmotwani-dev/flyrank-be-07-ai-api
- BE-08 PDF reports: https://github.com/aayushmotwani-dev/flyrank-be-08-pdf-reports
- BE-09 decision flow: https://github.com/aayushmotwani-dev/flyrank-be-09-decision-flow
- Capstone: https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations/blob/main/capstone-10x-README.md

### AI Fluency evidence

- Public foundations repo: https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations
- Live portfolio shell: https://aayushmotwani-dev.github.io/flyrank-fl-07-blank-live/
- FL-03 proof statement: https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations/blob/main/fl-03-proof-statement.md
- FL-06 personal agent spec: https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations/blob/main/fl-13-personal-agent-spec.md
- FL-07 build log: https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations/blob/main/fl-14-agent-build-log.md
- FL-09 documentation evidence: https://github.com/aayushmotwani-dev/flyrank-fl-06-week3-foundations/blob/main/fl-21-documentation-and-demo.md

## Retrospective

In Week 1 I set out to become more credible as a backend engineer by making small systems that another person could run, inspect, and test. I did not want a portfolio made only of technology names. I wanted the work to show how I think about inputs, data, failure cases, and the line between a successful request and a trustworthy system.

The work changed in a useful way. The early CRUD and SQLite projects started as straightforward API exercises. As the assignments progressed, I had to make the behavior more explicit: validate at the boundary, keep authentication state separate from application data, make duplicate requests safe, move slow work into a background job, and make a PDF or AI response understandable to a reviewer. The decision-flow project then forced the same thinking into a user-facing path rather than leaving the logic hidden in endpoints. The capstone brought the pieces together in one small evidence hub with authentication, SQLite persistence, a queued report job, PDF output, and a short cache.

The most transferable lesson was to define the observable behavior before adding code. A good test such as “the same idempotency key returns the same job” is more useful than a long checklist of internal functions. The second lesson was to treat failure behavior as part of the feature. Retries, terminal errors, unauthorized access, empty input, and restart persistence are not polish; they are where a backend earns trust. The third lesson was to leave honest ceilings in the README. The capstone is a learning system, not a production queue, and saying that clearly makes the evidence stronger rather than weaker.

I used AI for structure, questions, and review. I still had to understand the result, run the checks, and record where an external tool or physical device was unavailable. If I cannot explain a request-to-worker-to-report flow in plain words, the README is not finished yet.

Next I would build the capstone into a small hosted service with a real queue, stronger observability, and a proper account-scoped cache. I would also add a real phone check, a human critique, and a narrated demo recording. Those are clearly marked follow-ups here, not claims hidden behind a polished page.

## Build-in-public post draft

I shipped a small backend evidence hub as my FlyRank capstone. The most important decision was to keep the first version stdlib-only so I could see the whole flow: authenticated project creation, a `202 Accepted` report job, background completion, and a downloadable PDF. The limitation is deliberate: this is not a production queue or hosted multi-process service yet. I tested the behavior locally, published the evidence, and wrote down what I would upgrade next.

## Hours and sign-off status

The portal’s certification review is still pending for the backend and AI Fluency capstones. The public evidence is assembled here, while portal hour verification and human sign-off remain review steps rather than something I can honestly mark complete on someone else’s behalf.
