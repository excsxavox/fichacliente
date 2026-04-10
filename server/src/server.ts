import Fastify from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config/env.js";

const env = loadEnv();

const app = Fastify({
  logger: { level: env.LOG_LEVEL },
  requestIdHeader: "x-request-id",
  genReqId: (req) =>
    (req.headers["x-request-id"] as string | undefined) ?? crypto.randomUUID(),
});

await app.register(cors, {
  origin: true,
});

app.get("/health", async () => ({
  status: "ok",
  service: "fichacliente-bff",
  environment: env.NODE_ENV,
}));

app.get("/v1/meta/stack", async () => ({
  repository: "github.com/excsxavox/fichacliente",
  runtime: `node ${process.version}`,
  language: "TypeScript",
  framework: "Fastify 5",
  apiPrefix: "/v1",
  notes: [
    "PII: mask bank account in responses; redact email and ID in logs.",
    "Documents: expose only short-lived signed URLs to clients.",
    "Auth: Bearer JWT (or gateway) to be enforced on routes in later iterations.",
  ],
}));

app.setErrorHandler((err, req, reply) => {
  req.log.error({ err }, "request failed");
  const isProd = env.NODE_ENV === "production";
  const detail = err instanceof Error ? err.message : String(err);
  const message = isProd ? "Unexpected error" : detail;
  void reply.status(500).send({
    error: { code: "INTERNAL_ERROR", message },
  });
});

app.addHook("onSend", async (req, reply) => {
  const id = req.id;
  if (id) reply.header("x-request-id", id);
});

const address = await app.listen({ port: env.PORT, host: "0.0.0.0" });
app.log.info(`Listening at ${address}`);
