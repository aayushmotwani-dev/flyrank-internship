# Personal agent build log

## Starting point

I started with the FL-13 spec and the existing Claude Project. The first version asked for a polished case study immediately. That was too broad: it encouraged the assistant to write before checking evidence.

## Iteration 1 — too much output

The first prompt produced a long portfolio draft. I cut that path because it was hard to review and made unsupported claims easy to miss.

## Iteration 2 — evidence first

I changed the order to: evidence inventory, missing checks, claim review, then a short outline. I also added the instruction to say “not verified” when a test result or deployment check is absent.

## Live tool/data connection

The agent runs in the preserved Claude Project and uses the project files and repository material supplied in the session. The connected capability is file and command access in the Claude/Cowork environment; the activity panel showed files being read, files created, commands run, and tests exercised during the real background-job workflow. I did not give the agent GitHub write credentials.

## End-to-end run

I ran the narrow job against the background-job project evidence. The agent reviewed the brief, created a small set of review/test files, ran the local checks, exercised the API/worker path, and returned the observed success and failure cases. One cleanup command ended with exit code 144 because it stopped a process; I kept that detail in the log instead of presenting the run as perfectly clean.

## What I cut

I cut automatic publishing and automatic repository edits. The useful core job is the evidence review; adding write access would increase the risk without improving the first milestone.

## Current limit

This is a working agent workflow and build log, not a hosted multi-user product. A raw two-minute capture should be recorded from the live run before treating the workflow as a finished demo. For now, the linked Claude run and this log are the reviewable evidence.
