import express from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest.js";
import { decidePrompt } from "./model.js";
import { executeGraph } from "./workflow.js";

const app = express();
const port = Number(process.env.PORT || 3000);
app.use(express.json({ limit: "1mb" }));
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "decision-flow" }));
app.post("/api/workflow/run", async (req, res) => {
  try {
    const result = await executeGraph(req.body?.graph, req.body?.input, decidePrompt);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post("/api/workflow/event", async (req, res) => {
  await inngest.send({ name: "decision-flow/run", data: req.body });
  res.status(202).json({ accepted: true });
});

app.listen(port, () => console.log(`Decision Flow API listening on http://localhost:${port}`));
