export function normalizeDecision(value) {
  const answer = String(value).trim().toUpperCase();
  if (answer === "YES" || answer === "NO") return answer;
  throw new Error("Model must return only YES or NO");
}

export async function executeGraph(graph, input, decide) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  if (!nodes.length) throw new Error("Workflow needs at least one node");

  const byId = new Map(nodes.map((node) => [node.id, node]));
  let current = byId.get(graph.startNodeId) || nodes.find((node) => node.type === "start") || nodes[0];
  const visited = new Set();
  const executionOrder = [];
  const logs = [];

  for (let step = 0; current && step < 25; step += 1) {
    if (visited.has(current.id)) throw new Error("Workflow contains a loop");
    visited.add(current.id);
    executionOrder.push(current.id);
    const prompt = String(current.data?.prompt || current.data?.label || "Decide whether to continue");
    const decision = normalizeDecision(await decide(`${prompt}\nInput: ${String(input ?? "")}`));
    logs.push({ nodeId: current.id, label: current.data?.label || current.id, decision });

    const candidates = edges.filter((edge) => edge.source === current.id);
    const nextEdge = candidates.find((edge) => String(edge.sourceHandle || edge.data?.condition || "").toUpperCase() === decision)
      || (candidates.length === 1 ? candidates[0] : null);
    if (!nextEdge) return { decision, executionOrder, logs, finished: true };
    current = byId.get(nextEdge.target);
  }

  if (current) throw new Error("Workflow exceeded the 25-step safety limit");
  return { decision: null, executionOrder, logs, finished: true };
}
