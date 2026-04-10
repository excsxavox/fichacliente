/**
 * PII / datos sensibles: enmascaramiento para respuestas y logs.
 * No sustituye cifrado en reposo ni control de acceso — solo reduce exposición en superficies de salida.
 */

const VISIBLE_LAST = 4;

export function maskBankAccountLast4(value: string | null | undefined): string | null {
  if (value == null || value === "") return value ?? null;
  const digits = value.replace(/\D/g, "");
  if (digits.length <= VISIBLE_LAST) return "****";
  const masked = "*".repeat(Math.max(0, digits.length - VISIBLE_LAST));
  return `${masked}${digits.slice(-VISIBLE_LAST)}`;
}

export function redactEmailForLog(email: string | null | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "[redacted]";
  const safeLocal = local.length <= 2 ? "**" : `${local[0]}***${local[local.length - 1]}`;
  return `${safeLocal}@${domain}`;
}

export function redactIdentificationForLog(id: string | null | undefined): string {
  if (!id) return "";
  const s = String(id).trim();
  if (s.length <= 4) return "****";
  return `${"*".repeat(s.length - 4)}${s.slice(-4)}`;
}
