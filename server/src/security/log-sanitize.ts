import { redactEmailForLog, redactIdentificationForLog } from "./masking.js";

/** Evita volcar PII en logs estructurados; extender según campos del dominio. */
export function sanitizeForLogRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...record };
  if (typeof out.email === "string") out.email = redactEmailForLog(out.email);
  if (typeof out.identification === "string") out.identification = redactIdentificationForLog(out.identification);
  if (typeof out.identificationNumber === "string") {
    out.identificationNumber = redactIdentificationForLog(out.identificationNumber);
  }
  return out;
}
