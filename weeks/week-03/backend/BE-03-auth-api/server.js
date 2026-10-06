import express from "express";
import swaggerUi from "swagger-ui-express";
import { authClient as configuredAuthClient, createAuthClient } from "./auth-client.js";
import { requireUser } from "./auth-middleware.js";

const openapi = {
  openapi: "3.0.3",
  info: { title: "FlyRank Auth API", version: "1.0.0" },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  paths: {
    "/auth/signup": { post: { responses: { 201: { description: "Created" }, 400: { description: "Invalid input" } } } },
    "/auth/login": { post: { responses: { 200: { description: "Logged in" }, 400: { description: "Invalid input" }, 401: { description: "Invalid credentials" } } } },
    "/auth/logout": { post: { security: [{ bearerAuth: [] }], responses: { 204: { description: "Logged out" }, 401: { description: "Unauthorized" } } } },
    "/public/info": { get: { responses: { 200: { description: "Public information" } } } },
    "/protected/profile": { get: { security: [{ bearerAuth: [] }], responses: { 200: { description: "Authenticated profile" }, 401: { description: "Unauthorized" } } } },
    "/protected/dashboard": { get: { security: [{ bearerAuth: [] }], responses: { 200: { description: "Authenticated dashboard" }, 401: { description: "Unauthorized" } } } },
  },
};

function credentials(body) {
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  return email && password ? { email, password } : null;
}

function sessionPayload(data) {
  const session = data?.session;
  return {
    access_token: session?.access_token,
    refresh_token: session?.refresh_token,
    token_type: session?.token_type,
    expires_in: session?.expires_in,
    expires_at: session?.expires_at,
    user: session?.user ?? data?.user ?? null,
  };
}

export function createApp(authClient = configuredAuthClient ?? createAuthClient()) {
  const app = express();
  const protect = requireUser(authClient);
  app.use(express.json());

  app.get("/", (_request, response) => response.json({ name: "FlyRank Auth API", version: "1.0", docs: "/docs" }));
  app.get("/public/info", (_request, response) => response.json({ message: "Welcome stranger! This info is public." }));

  app.post("/auth/signup", async (request, response) => {
    const input = credentials(request.body);
    if (!input) return response.status(400).json({ error: "email and password are required" });
    const { data, error } = await authClient.auth.signUp(input);
    if (error) return response.status(400).json({ error: error.message });
    return response.status(201).json({ user: data.user, session: data.session });
  });

  app.post("/auth/login", async (request, response) => {
    const input = credentials(request.body);
    if (!input) return response.status(400).json({ error: "email and password are required" });
    const { data, error } = await authClient.auth.signInWithPassword(input);
    if (error || !data?.session) return response.status(401).json({ error: "Invalid login credentials" });
    return response.json(sessionPayload(data));
  });

  app.get("/protected/profile", protect, (request, response) => response.json({
    id: request.user.id,
    email: request.user.email,
    created_at: request.user.created_at,
  }));

  app.get("/protected/dashboard", protect, (request, response) => response.json({
    message: "Welcome to your dashboard",
    user: { id: request.user.id, email: request.user.email },
  }));

  app.post("/auth/logout", protect, async (request, response) => {
    const { error } = await authClient.signOut(request.accessToken);
    if (error) return response.status(502).json({ error: "Logout failed" });
    return response.status(204).send();
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  return app;
}

export { openapi };
