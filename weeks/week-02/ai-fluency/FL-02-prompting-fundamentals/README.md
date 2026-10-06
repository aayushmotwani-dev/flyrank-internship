# FL-02 — Prompting Fundamentals on Real Tasks

This log applies five named prompting techniques to a real task from my FL-01 audit: turning the FlyRank BE-06 background-job brief into an implementation checklist.

The checklist must preserve explicit requirements, separate implementation choices from requirements, name edge cases, and connect each important behavior to proof. The final prompt was run on both Claude and ChatGPT with the same BE-06 brief.

## The brief used

BE-06 asks for a small background-job API: accept slow work immediately with HTTP 202, return a job id, let a worker do the work, expose status and the result, make duplicate requests safe, retry failures, surface terminal failure through an alert, and explain how to run and verify the implementation.

## Iteration log

### Version 0 — naive prompt

Prompt: Make a checklist for this backend assignment.

Output excerpt: Set up the project, build the API, add a worker, add tests, write a README, and submit it.

- What changed and why: This is the one-line prompt I would have used before the track.
- Observed output difference: It named broad work areas, but it did not preserve the exact 202 response, job id, retry, idempotency, alert, or proof requirements.
- What still failed: It was impossible to tell whether every sentence in the brief had been covered.
- Next move: Give the model a role that matches the review job.

### Version 1 — role assignment

Technique added: role assignment only.

Prompt: Act as a careful backend requirements reviewer. Make a checklist for this backend assignment.

Output excerpt: Separate required behavior from implementation suggestions. Include API behavior, worker behavior, persistence, failure handling, tests, README, and submission checks.

- What changed and why: Added one role: careful backend requirements reviewer.
- Observed output difference: The answer started distinguishing requirements from choices and looked more like a review checklist than a coding to-do list.
- What still failed: It still had no BE-06 facts, so it mentioned likely categories rather than exact acceptance criteria.
- Next move: Add context and motivation.

### Version 2 — context and motivation

Technique added: context and motivation only.

Prompt: Act as a careful backend requirements reviewer. Make a checklist for this FlyRank BE-06 assignment. The goal is to help a junior engineer implement a small background-job API without dropping a requirement; every important behavior must have visible proof.

Output excerpt: Treat the checklist as a trace from brief to implementation to evidence. Do not turn unspecified framework or queue choices into requirements.

- What changed and why: Added the assignment identity, intended reader, and why the checklist exists.
- Observed output difference: The checklist became more cautious about scope and started asking for proof instead of only naming code tasks.
- What still failed: The answer still had to invent likely requirements because the brief itself was not included.
- Next move: Add a few-shot example of the required trace format.

### Version 3 — few-shot examples

Technique added: few-shot examples only.

Prompt: Act as a careful backend requirements reviewer. Make a checklist for this FlyRank BE-06 assignment. The goal is to help a junior engineer implement a small background-job API without dropping a requirement; every important behavior must have visible proof. Use this example format: Requirement: duplicate requests are safe. Implementation: use a persistence-level idempotency mechanism. Proof: send the same logical request twice and verify one logical job. Keep the behavior separate from the mechanism.

Output excerpt: Requirement: behavior. Implementation: smallest concrete action. Proof: test or manual check that a reviewer can repeat. Example: HTTP 202 acceptance means return before work finishes, proved by a delayed-work integration test.

- What changed and why: Added one concrete requirement/implementation/proof example.
- Observed output difference: The answer stopped collapsing build endpoint into one item and began splitting externally visible behavior from evidence.
- What still failed: A good trace could still be returned as an unstructured wall of text.
- Next move: Request a fixed output structure.

### Version 4 — output structure

Technique added: output structure only.

Prompt: Act as a careful backend requirements reviewer. Make a checklist for this FlyRank BE-06 assignment. The goal is to help a junior engineer implement a small background-job API without dropping a requirement; every important behavior must have visible proof. Use this example format: Requirement: duplicate requests are safe. Implementation: use a persistence-level idempotency mechanism. Proof: send the same logical request twice and verify one logical job. Keep the behavior separate from the mechanism. Return exactly: 1) a requirement-to-checklist table, 2) three edge cases, 3) a proof plan, 4) assumptions and questions.

Output excerpt: The table became the traceability artifact; edge cases were kept separate; the proof plan collected tests and manual checks; assumptions no longer appeared as hidden requirements.

- What changed and why: Added only the four requested sections.
- Observed output difference: The result was much easier to compare with a brief and hand to another engineer.
- What still failed: The reasoning was still written as one pass; a missed requirement could survive without an explicit extraction step.
- Next move: Add step decomposition.

### Version 5 — step decomposition

Technique added: step decomposition only.

Prompt: Act as a careful backend requirements reviewer. Make a checklist for this FlyRank BE-06 assignment. The goal is to help a junior engineer implement a small background-job API without dropping a requirement; every important behavior must have visible proof. Use this example format: Requirement: duplicate requests are safe. Implementation: use a persistence-level idempotency mechanism. Proof: send the same logical request twice and verify one logical job. Keep the behavior separate from the mechanism. Return exactly: 1) a requirement-to-checklist table, 2) three edge cases, 3) a proof plan, 4) assumptions and questions. Work in three passes: extract only explicit requirements from the brief; map each requirement to implementation evidence; then audit the result line by line for omissions. Never claim a check passed without supplied evidence.

Output excerpt: For BE-06 the model produced separate rows for background execution, immediate 202 acceptance, job id, worker execution, status/result, duplicate safety, retries, terminal alerting, small scope, and run/verify documentation. It also flagged process-boundary and alert-failure questions instead of silently deciding them.

- What changed and why: Added only the three-pass review instruction.
- Observed output difference: The final answer was more complete and more honest about what was not verified. It turned each claim into a check instead of treating a plausible design as proof.
- What still failed: The exact worker topology remains an implementation choice unless the brief specifies it.
- Next move: Run this final prompt against two models and compare concrete differences.

## Cross-model comparison

Claude chat: https://claude.ai/chat/29af553c-1ea1-46ff-8a81-317c8027be3e

Claude first refused to guess when only the prompt context was present. After I supplied the BE-06 brief, it extracted ten explicit rows and called out worker-crash and alert-failure questions. Its strongest point was keeping unknowns visible; the result was cautious and edge-case focused.

ChatGPT chat: https://chatgpt.com/c/6ac3dc83-6918-83ed-b2fa-3349ee5135e2

ChatGPT produced a broad traceability table and proof matrix. After the brief was supplied, it separated observable behavior from mechanisms, including the distinction between safe duplicate behavior and the choice of an idempotency key. Its strongest point was reusable structure and explicit evidence coverage. Before the brief was supplied, it was too generic, confirming why the actual source text belongs in the final prompt.

| Dimension | Claude | ChatGPT |
| --- | --- | --- |
| Tone | More cautious and questioning | More checklist-oriented and expansive |
| Accuracy boundary | Refused to fill missing requirements | Generalized first, then improved with the brief |
| Structure | Clear requirement rows and edge cases | Broad table and proof matrix |
| Failure point | Left topology decisions unresolved | Can overproduce generic categories before seeing the brief |
| What I would keep | Explicit unknowns and failure questions | Reusable evidence mapping and omission audit |

Both answers still need human review: the brief is the source of truth, and neither response counts as a passed test.

## Final reusable template

Act as a careful [domain] requirements reviewer. I am implementing [task] for [audience], and the goal is [why this checklist matters]. First extract only explicit requirements from the source brief. Then map each requirement to one concrete implementation action and one test or manual proof. Use this example format: Requirement: [observable behavior]. Implementation: [smallest mechanism, clearly labeled as a choice unless prescribed]. Proof: [repeatable check]. Return exactly: 1) requirement-to-checklist table, 2) three edge cases, 3) proof plan, 4) assumptions and questions. Finish with a line-by-line omission audit. Never invent requirements or claim a check passed without supplied evidence.

This works for a stranger because the placeholders identify the source, audience, purpose, evidence format, and honesty boundary without relying on my personal project memory.
