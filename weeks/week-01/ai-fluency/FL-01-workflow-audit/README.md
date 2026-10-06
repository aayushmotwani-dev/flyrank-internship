# FL-01: AI Workflow Audit and Tool Setup

**Participant:** Aayush Motwani  
**Track:** General AI Fluency  
**Date:** 5 October 2026

## How I classified work

I used four levels: **just me**, **delegate to AI with review**, **collaborate with AI**, and **fully automate**. I kept tasks as “just me” when the final judgement, personal responsibility, or learning outcome would be lost if I handed it over completely.

## My recurring-work audit

| Recurring task from my week | Classification | Why this level fits |
|---|---|---|
| Read a FlyRank assignment brief and turn it into a checklist | Collaborate with AI | AI can help find requirements and edge cases, but I decide what the brief means and what I will actually build. |
| Sketch an API contract before coding | Collaborate with AI | AI is useful for alternative endpoint and error designs; I choose the smallest contract that matches the assignment. |
| Implement a Node/Express endpoint | Collaborate with AI | AI can suggest a first pass, but I must understand the request path, validation, and response before keeping it. |
| Design a SQLite schema and query | Collaborate with AI | AI can review relationships and SQL, while I check that the tables represent the real data and constraints. |
| Run tests, reproduce a failure, and trace the cause | Delegate to AI with review | AI can help interpret output and suggest checks, but I run the test and confirm the fix myself. |
| Review authentication and input validation | Collaborate with AI | A second pair of eyes is useful, but security decisions need my judgement and a direct verification of the code. |
| Write the README and explain design decisions | Collaborate with AI | AI can improve structure and wording, but the explanation must match what I actually built and tested. |
| Create commits, check the public repository, and submit the assignment | Just me | This is my account, my public work, and my responsibility; I should inspect the final diff and destination before submitting. |
| Read a VR lecture or study note for an oral exam | Just me | I need to understand the material myself. A summary is useful only after I have checked it against the source. |
| Turn dense notes into self-test questions | Collaborate with AI | AI can generate questions, but I check every answer against the lecture and use the questions to test my own memory. |
| Tailor a job application or professional message | Collaborate with AI | AI can suggest clearer wording, but I decide what is true, appropriate, and in my own voice. |
| Keep assignment files, test results, and links organised | Delegate to AI with review | Sorting and naming can be assisted, but I review the final structure so nothing important is misplaced. |
| Plan the next study or coding session | Collaborate with AI | AI can make a realistic short plan, but I choose priorities based on my time and energy. |

## Tool setup and evidence

- **Claude:** configured a project named **Aayush - FlyRank AI Fluency Workflow**.
- **Claude Project instructions:** identify me as a backend engineering intern and university student; use a clear practical tone; explain decisions simply; prefer small maintainable solutions and explicit tests; never invent evidence; label assumptions and unknowns; help me finish FlyRank Backend AI Engineering and AI Fluency work.
- **Project link:** [Aayush - FlyRank AI Fluency Workflow](https://claude.ai/project/01a10d04-64a1-7444-a198-a2a6ae0b4642) (requires my Claude session).
- **ChatGPT:** used as an additional tool for planning, implementation review, and test-oriented explanations.
- **Anthropic Academy:** the official [AI Fluency: Framework & Foundations course page](https://anthropic.skilljar.com/ai-fluency-framework-foundations) was checked. The current page shows **Sign In / Enroll in Course**, so I am not marking the first module complete without a verified enrolled account. This is the one setup item still requiring account access.

## Three target tasks for FL-02 through FL-04

### 1. Turn an assignment brief into an implementation checklist

**Done well means:** every explicit requirement is mapped to a code or documentation item; at least three edge cases are listed; the plan names the test or manual check that will prove each important behavior; no requirement is silently dropped.

### 2. Review a backend project before publishing it

**Done well means:** the happy path and failure paths have runnable checks; node --check passes; secrets are excluded; the README starts from a clean checkout; the public repository contains the expected source and tests; the final link is the repository I actually inspected.

### 3. Turn study material into trustworthy revision notes

**Done well means:** every factual answer can be traced to the source material; uncertain or unreadable details are labeled instead of guessed; the notes include short self-test questions; I can explain the main ideas without reading the generated notes word for word.

## What I learned from the audit

The useful boundary is not “AI or no AI.” It is whether I am delegating a mechanical step, collaborating on a decision, or giving away responsibility that I still need to own. For my internship work, AI is most useful for checklists, alternative designs, test ideas, and explanations. I keep final publishing, security judgement, source checking, and personal learning under my own review.
