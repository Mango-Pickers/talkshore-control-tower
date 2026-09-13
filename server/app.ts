import { randomUUID } from "node:crypto";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHandler } from "hono";
import type { DecodedIdToken } from "firebase-admin/auth";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { hasFirebaseAdminConfig, serverConfig } from "./config.js";
import { getAdminAuth, getAdminFirestore } from "./firebase-admin.js";
import { ErrorSchema, ProfileInputSchema, ProfileResponseSchema, ProfileUpdateSchema } from "./schemas.js";

type AppEnvironment = { Variables: { requestId: string; user: DecodedIdToken } };
export const app = new OpenAPIHono<AppEnvironment>().basePath("/api");

const errorBody = (requestId: string, code: string, message: string, details?: unknown) => ({
  error: { code, message, ...(details === undefined ? {} : { details }), request_id: requestId },
});

const timestampToIso = (value: unknown) => value instanceof Timestamp ? value.toDate().toISOString() : null;

type UserRole = "learner" | "guide" | "moderator" | "admin";
const readRole = (value: unknown): UserRole =>
  value === "guide" || value === "moderator" || value === "admin" ? value : "learner";

const serializeProfile = (id: string, data: Record<string, unknown>, tokenEmail?: string) => ({
  id,
  email: typeof data.email === "string" ? data.email : tokenEmail ?? null,
  full_name: typeof data.full_name === "string" ? data.full_name : null,
  role: readRole(data.role),
  avatar_url: typeof data.avatar_url === "string" ? data.avatar_url : null,
  native_language: typeof data.native_language === "string" ? data.native_language : null,
  learning_language: typeof data.learning_language === "string" ? data.learning_language : null,
  level: typeof data.level === "string" ? data.level : null,
  goal: typeof data.goal === "string" ? data.goal : null,
  days_per_week: typeof data.days_per_week === "number" ? data.days_per_week : null,
  banned: data.banned === true,
  verified_guide: data.verified_guide === true,
  created_at: timestampToIso(data.created_at),
  updated_at: timestampToIso(data.updated_at),
});

app.use("*", async (c, next) => {
  c.set("requestId", c.req.header("x-request-id") ?? randomUUID());
  await next();
  c.header("x-request-id", c.get("requestId"));
});

app.use("/v1/*", cors({
  origin: (origin) => !origin || serverConfig.allowedOrigins.length === 0 || serverConfig.allowedOrigins.includes(origin) ? origin : "",
  allowHeaders: ["Authorization", "Content-Type", "Idempotency-Key", "X-Request-Id"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["X-Request-Id"],
}));

const authenticate: MiddlewareHandler<AppEnvironment> = async (c, next) => {
  const token = c.req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new HTTPException(401, { message: "A Firebase bearer token is required" });
  try {
    c.set("user", await getAdminAuth().verifyIdToken(token, true));
    await next();
  } catch {
    throw new HTTPException(401, { message: "The Firebase bearer token is invalid or expired" });
  }
};

app.use("/v1/auth/*", authenticate);
app.use("/v1/profiles/*", authenticate);

const healthRoute = createRoute({
  method: "get", path: "/v1/health", tags: ["Health"], summary: "Check API health", operationId: "getHealth",
  responses: { 200: { description: "API health status", content: { "application/json": { schema: z.object({ data: z.object({
    status: z.enum(["ok", "degraded"]), version: z.string(), environment: z.string(), firebase_admin: z.enum(["configured", "not_configured"]),
  }) }) } } } },
});

app.openapi(healthRoute, (c) => c.json({ data: {
  status: hasFirebaseAdminConfig() ? "ok" as const : "degraded" as const,
  version: serverConfig.version,
  environment: serverConfig.environment,
  firebase_admin: hasFirebaseAdminConfig() ? "configured" as const : "not_configured" as const,
} }));

const authMeRoute = createRoute({
  method: "get", path: "/v1/auth/me", tags: ["Authentication"], summary: "Get the current authenticated user", operationId: "getCurrentUser", security: [{ firebaseBearer: [] }],
  responses: {
    200: { description: "Current user", content: { "application/json": { schema: ProfileResponseSchema } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Profile not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});

app.openapi(authMeRoute, async (c) => {
  const user = c.get("user");
  const snapshot = await getAdminFirestore().collection("profiles").doc(user.uid).get();
  if (!snapshot.exists) return c.json(errorBody(c.get("requestId"), "profile_not_found", "Profile not found"), 404);
  return c.json({ data: serializeProfile(snapshot.id, snapshot.data()!, user.email) }, 200);
});

const getProfileRoute = createRoute({
  method: "get", path: "/v1/profiles/me", tags: ["Profiles"], summary: "Get my profile", operationId: "getMyProfile", security: [{ firebaseBearer: [] }],
  responses: {
    200: { description: "Profile", content: { "application/json": { schema: ProfileResponseSchema } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Profile not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});
app.openapi(getProfileRoute, async (c) => {
  const user = c.get("user");
  const snapshot = await getAdminFirestore().collection("profiles").doc(user.uid).get();
  if (!snapshot.exists) return c.json(errorBody(c.get("requestId"), "profile_not_found", "Profile not found"), 404);
  return c.json({ data: serializeProfile(snapshot.id, snapshot.data()!, user.email) }, 200);
});

const createProfileRoute = createRoute({
  method: "post", path: "/v1/profiles/me", tags: ["Profiles"], summary: "Create or return my profile", operationId: "createMyProfile", security: [{ firebaseBearer: [] }],
  request: { body: { required: true, content: { "application/json": { schema: ProfileInputSchema } } } },
  responses: {
    200: { description: "Existing profile", content: { "application/json": { schema: ProfileResponseSchema } } },
    201: { description: "Profile created", content: { "application/json": { schema: ProfileResponseSchema } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: ErrorSchema } } },
    422: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } },
  },
});

app.openapi(createProfileRoute, async (c) => {
  const user = c.get("user");
  const reference = getAdminFirestore().collection("profiles").doc(user.uid);
  const existing = await reference.get();
  if (existing.exists) return c.json({ data: serializeProfile(existing.id, existing.data()!, user.email) }, 200);
  await reference.create({
    id: user.uid, email: user.email ?? null, full_name: c.req.valid("json").full_name,
    role: "learner", banned: false, verified_guide: false,
    created_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp(),
  });
  const created = await reference.get();
  return c.json({ data: serializeProfile(created.id, created.data()!, user.email) }, 201);
});

const updateProfileRoute = createRoute({
  method: "patch", path: "/v1/profiles/me", tags: ["Profiles"], summary: "Update my profile", operationId: "updateMyProfile", security: [{ firebaseBearer: [] }],
  request: { body: { required: true, content: { "application/json": { schema: ProfileUpdateSchema } } } },
  responses: {
    200: { description: "Updated profile", content: { "application/json": { schema: ProfileResponseSchema } } },
    401: { description: "Unauthorized", content: { "application/json": { schema: ErrorSchema } } },
    404: { description: "Profile not found", content: { "application/json": { schema: ErrorSchema } } },
    422: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } },
  },
});

app.openapi(updateProfileRoute, async (c) => {
  const user = c.get("user");
  const reference = getAdminFirestore().collection("profiles").doc(user.uid);
  if (!(await reference.get()).exists) return c.json(errorBody(c.get("requestId"), "profile_not_found", "Profile not found"), 404);
  await reference.update({ ...c.req.valid("json"), updated_at: FieldValue.serverTimestamp() });
  const updated = await reference.get();
  return c.json({ data: serializeProfile(updated.id, updated.data()!, user.email) }, 200);
});

app.openAPIRegistry.registerComponent("securitySchemes", "firebaseBearer", {
  type: "http", scheme: "bearer", bearerFormat: "Firebase-ID-Token",
  description: "Firebase ID token returned after successful Firebase Authentication login.",
});

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "TalkShore API",
    version: serverConfig.version,
    description: "REST API for TalkShore Voyage and the TalkShore Control Tower. Protected endpoints require a Firebase ID token in the Authorization bearer header.",
    contact: { name: "TalkShore API Team" },
  },
  tags: [
    { name: "Health", description: "Deployment and dependency readiness." },
    { name: "Authentication", description: "Verified Firebase identity." },
    { name: "Profiles", description: "The authenticated user's TalkShore profile." },
  ],
  servers: [{ url: "/api", description: "Current deployment" }],
});
app.get("/docs", swaggerUI({ url: "/api/openapi.json" }));
app.get("/", (c) => c.redirect("/api/docs"));

app.notFound((c) => c.json(errorBody(c.get("requestId") ?? randomUUID(), "not_found", "Endpoint not found"), 404));
app.onError((error, c) => {
  const requestId = c.get("requestId") ?? randomUUID();
  if (error instanceof HTTPException) return c.json(errorBody(requestId, error.status === 401 ? "unauthorized" : "request_error", error.message), error.status);
  console.error(JSON.stringify({ request_id: requestId, message: error.message }));
  return c.json(errorBody(requestId, "internal_error", "An unexpected error occurred"), 500);
});
