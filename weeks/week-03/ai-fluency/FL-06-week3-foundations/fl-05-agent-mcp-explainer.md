# FL-05 — Agent Concepts and MCP Basics

## Workflow versus agent

I use “workflow” for a system whose path is decided in advance. The steps can include an LLM and tools, but the application controls the order and the handoffs. An “agent” is more open-ended: the model decides which tool or step to use next, observes the result, and can continue, change direction, or stop based on what it learned.

That distinction matches Anthropic’s explanation in Building effective agents: workflows follow predefined code paths, while agents dynamically direct their own process and tool use. The same article recommends starting with the simplest design and adding autonomy only when flexibility is worth the extra cost and error surface.

My FL-04 draft-critique-revise pipeline is a workflow, not an agent. It always follows gather, synthesize, draft, critique, revise, then human verification. The handoffs are fixed and the model is not allowed to decide that it needs a different investigation path. That predictability is useful for this task.

## What MCP adds

The Model Context Protocol is a standard way for an AI application to connect to external context and actions. It separates the model conversation from the server that exposes the capability. The three primitives are:

- Tools: executable functions the model can call, such as querying a service or writing a file.
- Resources: read-only data identified by a URI, such as a document or a project record.
- Prompts: reusable templates that a user can select and fill in.

The control boundary matters: tools are model-controlled, resources are application-controlled, and prompts are user-controlled. MCP does not make a model intelligent by itself; it gives a client a predictable contract for discovering and using external capabilities.

## Working connector evidence

I used Claude as the MCP-capable client environment and connected the working project context to a tool-enabled session. Three tool-backed tasks were run from the BE-06 workflow chat:

1. Read the backend-portfolio project memory so the run used the existing project context rather than a blank conversation.
2. Create a runnable test_jobs.py check from the brief.
3. Run the API/worker live and exercise the background-job paths.

The Claude activity panel showed tool-backed progress for these actions, including “Read memory, ran a command,” “Creating test_jobs.py,” and “Run API and worker live and exercise all paths.” Those are different from a plain answer because they changed or inspected an execution environment and returned results from it. The linked chat is the evidence record; the public walkthrough is in the companion FL-04 file.

I treat the evidence carefully: a tool call proves that the client invoked a tool, not that every generated claim is correct. The output still needs a human check against the repository and the actual tests.

## What FL-04 would need to become an agent

The smallest useful upgrade would be a bounded “evidence reviewer” agent. Instead of always running the same five steps, it could inspect a new brief, choose whether it needs repository files, a test run, or a documentation check, then use tools to gather that evidence. It would return to a fixed review checkpoint with a source list and a proposed note.

The guardrails would be important: read-only tools by default, an explicit workspace root, a maximum number of tool calls, a stop condition, and human approval before publishing or changing code. The agent should never invent a result when a tool fails. It should show the tool output and mark the claim as unverified.

I would not make FL-04 fully autonomous yet. The fixed workflow is easier to test and already matches the repeated task. I would add agent behavior only after a small evaluation set showed that choosing tools dynamically improved the result enough to justify the extra latency, cost, and failure modes.

## Sources read

- Anthropic Engineering: https://www.anthropic.com/engineering/building-effective-agents
- MCP specification: https://modelcontextprotocol.io/specification/draft/server/index
- MCP TypeScript SDK: https://ts.sdk.modelcontextprotocol.io/v2/clients/calling

## AI mistake check

The common mistake is calling every multi-step prompt an agent. I classified FL-04 as a workflow because its path is predetermined, and I named the specific change needed for agent behavior: model-directed tool selection inside a bounded loop with observable results and a stop condition.
