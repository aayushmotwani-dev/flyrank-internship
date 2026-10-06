# BE-09 — Decision Flow Studio

A small React Flow editor for building YES/NO AI decision paths. Each node owns a focused prompt, the server asks the model for exactly `YES` or `NO`, and the workflow follows the matching edge while recording execution order.

## Run locally

```bash
npm install
cp .env.example .env
npm run build
npm test
npm start
```

Open `http://localhost:3000`. For a no-cost local UI smoke test, set `MODEL_MODE=mock` in `.env`. For the real model path, add `OPENAI_API_KEY` and optionally `OPENAI_MODEL`.

The Inngest endpoint is available at `/api/inngest`. In another terminal, run `npm run inngest` to start the local Inngest Dev Server, then use `POST /api/workflow/event` to send `{ "graph": ..., "input": "..." }` as the `decision-flow/run` event payload.

## What is included

- React Flow canvas with add/connect/edit interactions and YES/NO branch labels.
- Shadcn/ui project configuration and CLI dependency for adding owned UI components.
- Inngest function with a durable `traverse-graph` step.
- OpenAI Responses API adapter with a 12-second timeout and strict output validation.
- Visual execution log, local save/load, and JSON export.
- Tests for normalization, branch traversal, execution order, and loop safety.

The repository intentionally does not include API keys. Live model and Inngest cloud calls require personal credentials in `.env`.

## Research notes

The implementation follows the Inngest Express pattern: expose `serve({ client, functions })` at `/api/inngest`, define functions with `createFunction`, and use `step.run` for the traversal step. The model adapter follows the official OpenAI JavaScript SDK Responses API shape.
