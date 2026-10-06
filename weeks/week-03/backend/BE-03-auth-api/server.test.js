import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { createApp } from "./server.js";

const user = { id: "user-123", email: "learner@example.com", created_at: "2026-10-05T00:00:00.000Z" };

const fakeAuth = {
  auth: {
    async signUp({ email }) {
      return { data: { user: { ...user, email }, session: null }, error: null };
    },
    async signInWithPassword({ email }) {
      if (email === "wrong@example.com") return { data: { session: null }, error: new Error("bad credentials") };
      return { data: { session: { access_token: "valid-token", refresh_token: "refresh-token", token_type: "bearer", expires_in: 3600, expires_at: 1791162000, user } }, error: null };
    },
    async getUser(token) {
      return token === "valid-token" ? { data: { user }, error: null } : { data: { user: null }, error: new Error("invalid token") };
    },
  },
  async signOut(token) {
    return token === "valid-token" ? { error: null } : { error: new Error("invalid token") };
  },
};

const server = createServer(createApp(fakeAuth));
await new Promise((resolve) => server.listen(0, resolve));
const base = "http://localhost:" + server.address().port;
const json = (path, options = {}) => fetch(base + path, { ...options, headers: { "content-type": "application/json", ...options.headers } });

test("auth flow validates inputs and protects routes", async () => {
  assert.equal((await fetch(base + "/public/info")).status, 200);
  assert.equal((await json("/auth/signup", { method: "POST", body: "{}" })).status, 400);
  assert.equal((await json("/auth/signup", { method: "POST", body: JSON.stringify({ email: user.email, password: "password123" }) })).status, 201);
  assert.equal((await json("/auth/login", { method: "POST", body: JSON.stringify({ email: "wrong@example.com", password: "bad" }) })).status, 401);
  const login = await json("/auth/login", { method: "POST", body: JSON.stringify({ email: user.email, password: "password123" }) });
  assert.equal(login.status, 200);
  assert.equal((await fetch(base + "/protected/profile")).status, 401);
  assert.equal((await fetch(base + "/protected/profile", { headers: { authorization: "Bearer changed-token" } })).status, 401);
  const profile = await fetch(base + "/protected/profile", { headers: { authorization: "Bearer valid-token" } });
  assert.deepEqual(await profile.json(), { id: user.id, email: user.email, created_at: user.created_at });
  assert.equal((await fetch(base + "/protected/dashboard", { headers: { authorization: "Bearer valid-token" } })).status, 200);
  assert.equal((await fetch(base + "/auth/logout", { method: "POST", headers: { authorization: "Bearer valid-token" } })).status, 204);
  assert.equal((await fetch(base + "/docs")).status, 200);
});

test.after(() => server.close());
