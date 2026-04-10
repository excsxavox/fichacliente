import Fastify from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config/env.js";
import { buildMvpScopeSnapshot } from "./application/mvp-scope.js";
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

app.get("/v1/meta/mvp-scope", async () => buildMvpScopeSnapshot());

app.get("/v1/meta/stack", async () => ({
  repository: "github.com/excsxavox/fichacliente",
  runtime: `node ${process.version}`,
  language: "TypeScript",
  framework: "Fastify 5",
  apiPrefix: "/v1",
  notes: [
    "MVP web de reservas (cadena de hoteles): alcance explícito, disponibilidad simulada y campos mínimos del huésped en GET /v1/meta/mvp-scope.",
    "BFF orientado a Ficha Cliente (H2-FC); contratos REST bajo /v1 en iteraciones posteriores.",
    "PII: enmascaramiento en salida y redacción en logs — ver src/security/.",
    "Documentos: exponer solo URLs firmadas de corta duración hacia el cliente.",
    "Auth en rutas públicas del MVP: ninguna por defecto; API keys/JWT pueden añadirse en fases posteriores.",
  ],
}));

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
