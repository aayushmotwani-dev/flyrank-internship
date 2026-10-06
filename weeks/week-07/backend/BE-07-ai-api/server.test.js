import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { createApp } from "./server.js";

const goodQuiz = (count) => ({ questions: Array.from({ length: count }, (_, index) => ({ question: "Question " + index, options: ["A", "B", "C", "D"], answerIndex: 0, explanation: "Because A is correct." })) });
const provider = (text = JSON.stringify(goodQuiz(2))) => ({ request: async () => ({ text, usage: { promptTokenCount: 10, candidatesTokenCount: 20 } }) });
async function listen(app) { const server = createServer(app); await new Promise((resolve) => server.listen(0, resolve)); return { server, base: "http://localhost:" + server.address().port }; }
const options = { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic: "history", difficulty: "easy", questionCount: 2 }) };

test("health reports the feature state", async () => { const { server, base } = await listen(createApp({ provider: provider() })); assert.deepEqual(await (await fetch(base + "/health")).json(), { status: "ok", aiEnabled: true }); server.close(); });
test("rejects a missing topic", async () => { const { server, base } = await listen(createApp({ provider: provider() })); assert.equal((await fetch(base + "/quiz", { ...options, body: JSON.stringify({ difficulty: "easy", questionCount: 2 }) })).status, 400); server.close(); });
test("rejects an unknown difficulty", async () => { const { server, base } = await listen(createApp({ provider: provider() })); assert.equal((await fetch(base + "/quiz", { ...options, body: JSON.stringify({ topic: "history", difficulty: "wild", questionCount: 2 }) })).status, 400); server.close(); });
test("rejects an unsafe question count", async () => { const { server, base } = await listen(createApp({ provider: provider() })); assert.equal((await fetch(base + "/quiz", { ...options, body: JSON.stringify({ topic: "history", difficulty: "easy", questionCount: 11 }) })).status, 400); server.close(); });
test("honors the kill switch", async () => { const { server, base } = await listen(createApp({ provider: provider(), enabled: false })); assert.equal((await fetch(base + "/quiz", options)).status, 503); server.close(); });
test("returns a validated quiz", async () => { const { server, base } = await listen(createApp({ provider: provider() })); const response = await fetch(base + "/quiz", options); assert.equal(response.status, 200); assert.equal((await response.json()).questions.length, 2); server.close(); });
test("repairs invalid model JSON once", async () => { let calls = 0; const { server, base } = await listen(createApp({ provider: { request: async () => ({ text: ++calls === 1 ? "not json" : JSON.stringify(goodQuiz(2)), usage: null }) } })); assert.equal((await fetch(base + "/quiz", options)).status, 200); assert.equal(calls, 2); server.close(); });
test("fails closed when the provider cannot produce valid output", async () => { const { server, base } = await listen(createApp({ provider: provider(JSON.stringify({ questions: [] })) })); assert.equal((await fetch(base + "/quiz", options)).status, 502); server.close(); });
