# FlyRank Internship Portfolio

One structured home for Aayush Motwani's FlyRank AI internship work.

The repository is organized week by week. Backend engineering assignments are kept beside the related AI-fluency evidence, while each assignment remains self-contained with its original README and runnable files.

## At a glance

| Week | Backend engineering | AI fluency / portfolio evidence |
| --- | --- | --- |
| 01 | [BE-01 — CRUD API](weeks/week-01/backend/BE-01-crud-api) | [FL-01 — Workflow audit](weeks/week-01/ai-fluency/FL-01-workflow-audit) |
| 02 | [BE-02 — SQLite API](weeks/week-02/backend/BE-02-sqlite-api) | [FL-02 — Portfolio sitemap](weeks/week-02/ai-fluency/FL-02-portfolio-sitemap), [FL-02 — Prompting fundamentals](weeks/week-02/ai-fluency/FL-02-prompting-fundamentals) |
| 03 | [BE-03 — Auth API](weeks/week-03/backend/BE-03-auth-api) | [FL-03 — Proof statement](weeks/week-03/ai-fluency/FL-03-proof-statement), [FL-06 — Week 3 foundations](weeks/week-03/ai-fluency/FL-06-week3-foundations) |
| 04 | [BE-04 — Containerized API](weeks/week-04/backend/BE-04-containerized-api) | [FL-04 — Cases](weeks/week-04/ai-fluency/FL-04-cases) |
| 05 | [BE-05 — Polite scraper](weeks/week-05/backend/BE-05-polite-scraper) | [FL-05 — Prompt ladder](weeks/week-05/ai-fluency/FL-05-prompt-ladder) |
| 06 | [BE-06 — Background job](weeks/week-06/backend/BE-06-background-job) | — |
| 07 | [BE-07 — AI quiz API](weeks/week-07/backend/BE-07-ai-api) | [FL-07 — Empty but live](weeks/week-07/ai-fluency/FL-07-blank-live) |
| 08 | [BE-08 — PDF reports](weeks/week-08/backend/BE-08-pdf-reports) | — |
| 09 | [BE-09 — Decision Flow Studio](weeks/week-09/backend/BE-09-decision-flow) | — |

## Recommended reading path

1. Start with [BE-01](weeks/week-01/backend/BE-01-crud-api) to see the basic API.
2. Follow the backend progression through SQLite, authentication, PostgreSQL, scraping, workers, AI validation, reporting, and decision workflows.
3. Read [FL-03](weeks/week-03/ai-fluency/FL-03-proof-statement) to understand the central engineering proof: reliable asynchronous job handling.
4. Finish with [BE-09](weeks/week-09/backend/BE-09-decision-flow), the most advanced full-stack workflow in the series.

## Tracks

### Backend engineering

The BE track progresses from a small in-memory CRUD API to persistent data, authentication, Docker, scraping, background jobs, AI output validation, PDF generation, and durable decision workflows.

### AI fluency and portfolio evidence

The FL track documents workflow audits, prompting experiments, proof statements, case studies, a live portfolio shell, and the supporting foundations package.

## Running an assignment

Each assignment has its own README and dependency setup. Open the assignment folder you want to run, then follow that folder's README. Do not assume that dependencies or environment variables are shared between weeks.

## Notes

- The two FL-02 repositories are intentionally preserved as separate projects: portfolio sitemap and prompting fundamentals.
- The week mapping is based on the BE sequence and the FL numbering, with the original `week3` label retained for FL-06.
- Secrets and local environment files are not included. Use each assignment's `.env.example` where provided.
