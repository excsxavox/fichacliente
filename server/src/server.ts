import Fastify from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config/env.js";
import { getHotelMvpDemoSession } from "./demo/hotelMvpDemoSession.js";
import {
  getHotelBusinessRulesContract,
  getHotelStateMatrixPayload,
} from "./domain/hotel/index.js";
import { BusinessRuleError } from "./errors/business-rule-error.js";
import { getPersistenceMeta } from "./persistence/choice.js";
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
  mvpReservationDecision: {
    choice: "C" as const,
    label:
      "Convivencia en este monorepo: MVP reservas y Ficha Cliente con namespacing claro bajo /v1; rutas y módulos dedicados y UI separada.",
    actaRelativePath: "docs/acta-decision-mvp-reservas.md",
  },
  notes: [
    "Decisión MVP reservas (acta): opción C — convivencia con namespacing /v1; ver mvpReservationDecision y docs/acta-decision-mvp-reservas.md.",
    "BFF orientado a Ficha Cliente (H2-FC); contratos REST del MVP bajo /v1 con rutas y módulos dedicados.",
    "PII: enmascaramiento en salida (p. ej. cuenta bancaria) y redacción en logs — ver src/security/.",
    "Documentos: exponer solo URLs firmadas de corta duración hacia el cliente.",
    "Auth: JWT (o gateway) pendiente de aplicar en rutas protegidas.",
  ],
}));

app.get("/v1/meta/persistence", async () => {
  const meta = getPersistenceMeta(env.persistence.engine);
  return {
    engine: meta.engine,
    databaseUrlSummary: env.persistence.safeSummary,
    rationale: meta.rationale,
    concurrencyMvp: meta.concurrencyMvp,
    migrationPathToPostgres: meta.migrationPathToPostgres,
    configuration: meta.env,
  };
});

/** Matriz de estados hotel MVP: reserva y habitación (transiciones permitidas/prohibidas). */
app.get("/v1/hotel/state-matrix", async () => getHotelStateMatrixPayload());

/** Contrato de reglas MVP: cancelación, no-show, cambio de habitación y códigos 409. */
app.get("/v1/meta/hotel-business-rules", async () => getHotelBusinessRulesContract());

/** Casos de demo MVP hotelero (guion + datos seed + pasos HTTP previstos). */
app.get("/v1/demo/hotel-mvp-session", async (req) => {
  const actorId = (req.headers["x-actor-id"] as string | undefined)?.trim();
  req.log.info(
    sanitizeForLogRecord({
      demo: "hotel-mvp-session",
      actorIdPresent: Boolean(actorId),
    }),
  );
  return getHotelMvpDemoSession();
});

app.setErrorHandler((err: unknown, req, reply) => {
  if (err instanceof BusinessRuleError) {
    req.log.warn(
      sanitizeForLogRecord({
        businessCode: err.code,
        path: req.url,
      }),
    );
    void reply.status(409).send({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

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
app.log.info(
  sanitizeForLogRecord({
    msg: "Server started",
    address,
    persistenceEngine: env.persistence.engine,
    databaseUrlSummary: env.persistence.safeSummary,
  }),
);
