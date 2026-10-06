# Personal agent design — evidence-hub review assistant

## Job to be done

When I finish a small backend build, the assistant helps me turn the raw evidence into a short review checklist and a plain-language case-study outline. It should point out missing tests, unclear claims, and links that need a second check. It is a review assistant, not an autonomous publisher.

## User and frequency

The user is me. I would run it after each meaningful backend assignment or before a portfolio update, roughly once or twice a week.

## Platform choice

I will use the existing Claude Project with the same identity kit and portfolio context already used for the Week 3 work. This is the shortest free path I can actually run now. An n8n agent would be useful later for scheduled repository checks, but it adds hosting and credential setup before I have proved the core job.

## Tools and data access

- Public GitHub repository links and README text that I explicitly provide.
- Local test output pasted or attached by me.
- The preserved Claude Project instructions for voice, stack, and evidence standards.

The agent may read these inputs and draft a review. It does not receive GitHub write access, private email, tokens, or payment data.

## Draft instructions

“Read the supplied repository notes and test output. Return: (1) what the project does, (2) the strongest evidence, (3) one missing or weak check, (4) any claim that is stronger than the evidence, and (5) a three-beat case-study outline: problem, what I did, what came of it. Ask before suggesting a public edit. If evidence is missing, say so instead of filling the gap.”

## Pre-build eval cases

1. A README with a passing test command should produce a concise evidence summary and no invented user numbers.
2. A README with a failed command should call out the failure instead of calling the project verified.
3. A project with an ambiguous “production-ready” sentence should flag the claim.
4. A private-looking token in pasted input should be ignored and explicitly recommended for removal, never repeated.
5. A repository with no test output should say that verification is missing and suggest the smallest relevant check.

## Risks and guardrails

- Never publish, edit, or message anyone without my explicit review.
- Never invent performance, adoption, or deployment claims.
- Never repeat secrets or personal data from pasted input.
- Ask before following an external link that could expose private work.
- Keep a human decision between the draft and any GitHub or FlyRank submission.

## Success measure

For one real repository, the agent should produce a useful review in under five minutes and identify at least one check or wording improvement that I can verify myself.
