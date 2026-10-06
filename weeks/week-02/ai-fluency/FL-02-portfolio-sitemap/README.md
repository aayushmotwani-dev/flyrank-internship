# FL-02: Draw the Path - Portfolio Sitemap + Toolkit

**Participant:** Aayush Motwani  
**Track:** General AI Fluency  
**Date:** 5 October 2026

## Proof statement and one action

**Proof statement:** I build and explain small backend systems that turn clear requirements into tested, documented APIs with reliable data and background jobs.

**One action:** open a project repository and follow its README.

## Sitemap sketch

I kept the first version intentionally small. The portfolio should make the proof easy to check, not make a visitor learn a complicated navigation system.

    Home
    |- proof statement + short introduction
    |- featured projects (the evidence cards live here)
    |  |- Open repo and follow the README
    |- About
    |  |- background, tools, and honest AI workflow
    - Contact
       - GitHub and one professional contact route

The Projects page is deliberately not separate in this first version. The pressure test showed that a visitor would otherwise need to go Home -> Projects -> project card -> GitHub -> README. Putting a small number of real project cards directly on Home keeps the requested action visible. If the portfolio grows enough to need filtering or many case studies, I can split Projects out later.

## Toolkit setup

- Claude: available and used for the portfolio project and pressure test.
- ChatGPT: available and used for planning and implementation review.
- Gemini: account/tool available in my browser workspace for comparison and research.
- Perplexity: included in the toolkit plan for source-oriented research.

## Claude Project evidence

- Project: [Aayush - Backend Portfolio](https://claude.ai/project/01a10d08-0c59-76a0-a67d-9eab64c68c89)
- Custom instructions include the proof statement, the one visitor action, the tutor role, and rules against inventing projects or results.
- Pressure-test conversation: [Portfolio sitemap review](https://claude.ai/chat/f8c57b30-d32f-404e-876a-d0eb19e55851)

## Pressure-test prompt and saved output

I asked Claude:

> Here is my current portfolio plan. Proof statement: I build and explain small backend systems that turn clear requirements into tested, documented APIs with reliable data and background jobs. One visitor action: open a project repository and follow its README. Sitemap: Home with the proof statement and a View backend projects button; Projects with four or five case-study cards; About; Contact. Pressure-test this against the proof statement and the one action. Identify one page or section to remove or change, one missing piece of evidence, and one concrete improvement.

The useful changes from the response were:

1. **Change:** merge Projects into Home for now, so the one action is closer to the first screen.
2. **Missing evidence:** each claim needs a checkable proof point, such as the exact test command, where the API docs live, what data store is used, and what the background job does.
3. **Concrete improvement:** use the same proof checklist on every project card: Problem, Tests, Docs, Data, Background job, and the Open repo and follow the README button.

I also kept the warning that four or five cards are a target, not evidence. I should show only projects that are real, public, and documented well enough for a stranger to verify.

## Change I will make

The Home page will show the proof statement, then a short row of verified project cards. Each card will link directly to the repository and show the exact test command and the relevant README section. I will add more cards only when the project is genuinely ready, rather than filling the sitemap with placeholders.
