import { Inngest } from "inngest";
import { decidePrompt } from "./model.js";
import { executeGraph } from "./workflow.js";

export const inngest = new Inngest({ id: "flyrank-be-09-decision-flow" });

export const runDecisionFlow = inngest.createFunction(
  { id: "run-decision-flow", retries: 2, triggers: [{ event: "decision-flow/run" }] },
  async ({ event, step }) => step.run("traverse-graph", () => executeGraph(event.data.graph, event.data.input, decidePrompt))
);

export const functions = [runDecisionFlow];
