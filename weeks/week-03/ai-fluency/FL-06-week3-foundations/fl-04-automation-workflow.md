# FL-04 — Ship an Automation Workflow v2

## Chosen pipeline

I chose a draft, critique, revise workflow for turning a real FlyRank requirement into a clear implementation note. It fits my backend work because the output still needs technical judgment, but the repeated shape can be standardized.

Flow: real brief -> gather requirements -> synthesize risks -> draft note -> critique -> revise -> human verification.

## Claude Project instruction

You are helping me turn one real project brief into a short implementation note.

1. Gather: extract the user-visible goal, constraints, inputs, outputs, edge cases, and verification evidence. Mark unknowns instead of guessing.
2. Synthesize: group the requirements into a small flow and list the two riskiest assumptions.
3. Draft: write Problem, Decision, Flow, and Verification sections using concrete names from the brief.
4. Critique: check for invented requirements, missing failure handling, unsupported results, vague success criteria, and wording I could not defend.
5. Revise: apply only justified fixes and finish with Human checks still required.

Never invent tests, URLs, course completion, user numbers, or integrations. If the brief is missing, stop and ask for it.

## Five real runs

1. BE-06 background job brief: grouped the 202 response, job id, status endpoint, idempotency, retry, and alert requirements. Human check: run the API and inspect the failure path.
2. BE-08 PDF report brief: separated input validation, report generation, output file, and date formatting. Human check: open the generated PDF and check layout.
3. BE-09 decision-flow brief: separated states, transitions, terminal outcomes, and storage. Human check: run valid and invalid transitions.
4. FL-05 prompt-ladder brief: kept each prompt version to one added layer and listed verification criteria. Human check: compare each version against the brief.
5. Week 3 portfolio map: organized claim, pages, evidence, CTA, and honest gather list. Human check: open each linked repository and remove unsupported claims.

## Honest timing

Setup took about 20 minutes. A manual note is about 15 minutes; a workflow pass is about 5 minutes plus 5 minutes of human checking. Five runs are roughly 75 minutes manually versus about 70 minutes including setup and checks. The saving is modest at five runs and becomes more useful when the shape repeats.

## Failure points

- Missing briefs make the model fill gaps with plausible but false requirements, so the workflow stops and asks for the source.
- Generic prompts produce generic notes, so the gather step requires the actual brief and named evidence.
- A polished draft can hide an untested claim, so critique and human verification remain mandatory.
- Long inputs can compress details; I would split them into labeled source blocks before adding tooling.

This is a no-code Claude Project workflow, not an unattended n8n service. It drafts and checks explanations; tests, links, and runtime behavior still need human verification. The easy AI mistake would be to call generated notes proof that the underlying systems worked. I did not do that.
