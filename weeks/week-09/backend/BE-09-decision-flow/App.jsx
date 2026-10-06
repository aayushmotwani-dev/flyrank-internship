import { useCallback, useEffect, useMemo, useState } from "react";
import { Background, Controls, MiniMap, ReactFlow, addEdge, useEdgesState, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  { id: "start", position: { x: 80, y: 180 }, data: { label: "Check request", prompt: "Is this request urgent?" }, type: "default" },
  { id: "yes", position: { x: 390, y: 80 }, data: { label: "Fast track", prompt: "Should this request be fast-tracked?" }, type: "default" },
  { id: "no", position: { x: 390, y: 300 }, data: { label: "Standard queue", prompt: "Should this request enter the standard queue?" }, type: "default" }
];
const initialEdges = [
  { id: "start-yes", source: "start", target: "yes", sourceHandle: "YES", label: "YES", animated: true },
  { id: "start-no", source: "start", target: "no", sourceHandle: "NO", label: "NO" }
];

function loadGraph() {
  try { return JSON.parse(localStorage.getItem("decision-flow-graph")) || { nodes: initialNodes, edges: initialEdges }; }
  catch { return { nodes: initialNodes, edges: initialEdges }; }
}

export default function App() {
  const saved = useMemo(loadGraph, []);
  const [nodes, setNodes, onNodesChange] = useNodesState(saved.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(saved.edges);
  const [input, setInput] = useState("A customer needs a response today");
  const [selected, setSelected] = useState(saved.nodes[0]?.id || "start");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Ready to run");

  useEffect(() => localStorage.setItem("decision-flow-graph", JSON.stringify({ nodes, edges })), [nodes, edges]);
  const onConnect = useCallback((connection) => setEdges((current) => addEdge({ ...connection, label: connection.sourceHandle || "path" }, current)), [setEdges]);

  function updateSelected(field, value) {
    setNodes((current) => current.map((node) => node.id === selected ? { ...node, data: { ...node.data, [field]: value } } : node));
  }

  function addNode() {
    const id = `node-${Date.now()}`;
    setNodes((current) => [...current, { id, position: { x: 180, y: 430 }, data: { label: "New decision", prompt: "Should we continue?" } }]);
    setSelected(id);
  }

  async function runFlow() {
    setStatus("Running through the flow…");
    try {
      const response = await fetch("/api/workflow/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ graph: { nodes, edges, startNodeId: "start" }, input }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setLogs(result.logs || []);
      setStatus(`Finished ${result.executionOrder.length} node${result.executionOrder.length === 1 ? "" : "s"}`);
    } catch (error) { setStatus(error.message); }
  }

  function exportGraph() {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "decision-flow.json"; link.click(); URL.revokeObjectURL(url);
  }

  const selectedNode = nodes.find((node) => node.id === selected) || nodes[0];
  return <main className="shell">
    <header><div><span className="eyebrow">FLYRANK / BE-09</span><h1>Decision Flow Studio</h1><p>Sketch a YES/NO workflow, then let each node make one focused decision.</p></div><div className="actions"><button onClick={() => localStorage.setItem("decision-flow-graph", JSON.stringify({ nodes, edges }))}>Save</button><button onClick={exportGraph}>Export JSON</button></div></header>
    <section className="toolbar"><label>Test input<input value={input} onChange={(event) => setInput(event.target.value)} /></label><button className="primary" onClick={runFlow}>Run workflow</button><span className="status">{status}</span></section>
    <section className="workspace"><div className="canvas"><ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => setSelected(node.id)} fitView><Background color="#dfe8e2" gap={22} /><Controls /><MiniMap /></ReactFlow></div>
      <aside><div className="panel-heading"><h2>Node editor</h2><button onClick={addNode}>+ Add</button></div>{selectedNode && <><label>Label<input value={selectedNode.data.label} onChange={(event) => updateSelected("label", event.target.value)} /></label><label>Prompt<textarea rows="4" value={selectedNode.data.prompt} onChange={(event) => updateSelected("prompt", event.target.value)} /></label></>}<div className="logs"><h2>Execution log</h2>{logs.length ? logs.map((log) => <div className="log" key={log.nodeId}><span>{log.label}</span><b className={log.decision === "YES" ? "yes" : "no"}>{log.decision}</b></div>) : <p className="muted">Run the flow to see each decision.</p>}</div></aside>
    </section>
  </main>;
}
