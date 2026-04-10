import Fastify from "fastify";
import { loadEnv } from "./config/env.js";
import { sanitizeForLogRecord } from "./security/log-sanitize.js";

const env = loadEnv();

const app = Fastify({
  logger: {
    level: env.LOG_LEVEL,
  },
});

app.get("/health", async () => ({
  status: "ok",
  service: "fichacliente-bff",
  environment: env.NODE_ENV,
}));

app.get("/v1/meta/stack", async () => ({
  repository: "fichacliente",
  runtime: "node",
  language: "typescript",
  framework: "fastify",
  apiPrefix: "/v1",
  notes: [
    "BFF orientado a Ficha Cliente (H2-FC); contratos REST bajo /v1 en iteraciones posteriores.",
    "PII: enmascaramiento en salida (p. ej. cuenta bancaria) y redacción en logs — ver src/security/.",
    "Documentos: exponer solo URLs firmadas de corta duración hacia el cliente.",
  ],
}));

app.addHook("onRequest", async (req, reply) => {
  const requestId = req.headers["x-request-id"];
  if (typeof requestId === "string" && requestId.length > 0) {
    reply.header("x-request-id", requestId);
  }
});

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
  reply.status(statusCode).send({
    error: {
      code: "INTERNAL_ERROR",
      message: env.NODE_ENV === "production" ? "Unexpected error" : e.message,
    },
  });
});

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, "server listening");
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
};

void start();
