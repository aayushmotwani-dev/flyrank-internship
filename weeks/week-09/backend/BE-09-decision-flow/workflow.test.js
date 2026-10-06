import test from "node:test";
import assert from "node:assert/strict";
import { executeGraph, normalizeDecision } from "./workflow.js";

const graph = { startNodeId: "start", nodes: [
  { id: "start", type: "start", data: { label: "Urgent?", prompt: "Is it urgent?" } },
  { id: "yes", data: { label: "Fast track", prompt: "Fast track?" } },
  { id: "no", data: { label: "Queue", prompt: "Queue?" } }
], edges: [
  { source: "start", target: "yes", sourceHandle: "YES" },
  { source: "start", target: "no", sourceHandle: "NO" }
] };

test("normalizes only YES and NO", () => {
  assert.equal(normalizeDecision(" yes "), "YES");
  assert.throws(() => normalizeDecision("maybe"), /only YES or NO/);
});

test("follows the YES branch and records order", async () => {
  const result = await executeGraph(graph, "deadline today", async (prompt) => /urgent/i.test(prompt) ? "YES" : "NO");
  assert.deepEqual(result.executionOrder, ["start", "yes"]);
  assert.deepEqual(result.logs.map((log) => log.decision), ["YES", "NO"]);
});

test("rejects a loop before it can run forever", async () => {
  const loop = { ...graph, edges: [{ source: "start", target: "start", sourceHandle: "YES" }] };
  await assert.rejects(() => executeGraph(loop, "x", async () => "YES"), /loop/);
});
