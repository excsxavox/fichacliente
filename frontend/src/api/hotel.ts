import type { HealthResponse, StackMetaResponse } from "@fichacliente/api-contracts";
import {
  parseHealthResponse,
  parseStackMetaResponse,
} from "@fichacliente/api-contracts";
import { ApiError, fetchJson } from "./client";

export type BffStartupSnapshot = {
  health: HealthResponse;
  stackMeta: StackMetaResponse;
};

function formatContractParseFailure(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown }).issues)
  ) {
    const issues = (err as { issues: { path: (string | number)[]; message: string }[] })
      .issues;
    if (issues.length > 0) {
      return issues
        .map((i) => `${i.path.filter(Boolean).join(".") || "(root)"}: ${i.message}`)
        .join("; ");
    }
  }
  if (err instanceof Error) return err.message;
  return "Respuesta inválida del servidor (no coincide con el contrato de la API).";
}

/**
 * Carga en paralelo health + metadatos de stack y valida con el contrato compartido.
 * Rutas hoteleras del MVP irán bajo `/v1/hotel`; esta función cubre el arranque del BFF.
 */
export async function fetchBffStartupSnapshot(): Promise<BffStartupSnapshot> {
  const [healthRaw, stackRaw] = await Promise.all([
    fetchJson<unknown>("/health"),
    fetchJson<unknown>("/v1/meta/stack"),
  ]);
  try {
    return {
      health: parseHealthResponse(healthRaw),
      stackMeta: parseStackMetaResponse(stackRaw),
    };
  } catch (e) {
    throw new ApiError(502, formatContractParseFailure(e), crypto.randomUUID());
  }
}
