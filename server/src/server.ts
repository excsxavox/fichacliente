import Fastify from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config/env.js";
import { PRODUCT_ROUTING_POLICY } from "./config/product-routing.js";
import { sanitizeForLogRecord } from "./security/log-sanitize.js";

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
    "BFF orientado a Ficha Cliente (H2-FC); contratos REST bajo /v1 en iteraciones posteriores.",
    "Convivencia Ficha Cliente vs hoteles: GET /v1/meta/product-routing (JSON estable para front y otros agentes).",
    "PII: enmascaramiento en salida (p. ej. cuenta bancaria) y redacción en logs — ver src/security/.",
    "Documentos: exponer solo URLs firmadas de corta duración hacia el cliente.",
    "Auth: JWT (o gateway) pendiente de aplicar en rutas protegidas.",
  ],
}));

/** Decisión de producto: prefijos API, naming UI y home compartida (tarea flujo — documentación viva). */
app.get("/v1/meta/product-routing", async () => PRODUCT_ROUTING_POLICY);

app.setErrorHandler((err: unknown, req, reply) => {
  const e = err instanceof Error ? err : new Error(String(err));
  req.log.error(
    sanitizeForLogRecord({
      err: e.message,
      code: (e as NodeJS.ErrnoException).code,
      path: req.url,
    }),
  );
  const statusFromErr =
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as { statusCode: unknown }).statusCode === "number"
      ? (err as { statusCode: number }).statusCode
      : undefined;
  const statusCode = statusFromErr !== undefined && statusFromErr >= 400 ? statusFromErr : 500;
  void reply.status(statusCode).send({
    error: {
      code: "INTERNAL_ERROR",
      message: env.NODE_ENV === "production" ? "Unexpected error" : e.message,
    },
  });
});

app.addHook("onSend", async (req, reply) => {
  const id = req.id;
  if (id) reply.header("x-request-id", id);
});

const address = await app.listen({ port: env.PORT, host: "0.0.0.0" });
app.log.info(`Listening at ${address}`);
