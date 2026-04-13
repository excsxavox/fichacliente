import type { PersistenceEngine } from "./choice.js";

export interface ParsedDatabaseUrl {
  engine: PersistenceEngine;
  /** URL normalizada para logging (sin credenciales). */
  safeSummary: string;
}

const SQLITE_PREFIX = "file:";

function isPostgresUrl(raw: string): boolean {
  const lower = raw.toLowerCase();
  return lower.startsWith("postgres://") || lower.startsWith("postgresql://");
}

/**
 * Interpreta `DATABASE_URL` y determina el motor sin exponer secretos en logs.
 */
export function parseDatabaseUrl(databaseUrl: string): ParsedDatabaseUrl {
  const trimmed = databaseUrl.trim();
  if (trimmed.length === 0) {
    throw new Error("DATABASE_URL must not be empty");
  }

  if (trimmed.startsWith(SQLITE_PREFIX)) {
    const pathPart = trimmed.slice(SQLITE_PREFIX.length).split("?")[0] ?? "";
    const safeSummary = pathPart.includes(":")
      ? "file:***" // evitar rutas largas con datos sensibles en nombre
      : `file:${pathPart.split("/").pop() ?? "hotel.db"}`;
    return { engine: "sqlite", safeSummary };
  }

  if (isPostgresUrl(trimmed)) {
    try {
      const u = new URL(trimmed);
      const host = u.hostname || "unknown-host";
      const db = (u.pathname || "").replace(/^\//, "") || "postgres";
      return {
        engine: "postgres",
        safeSummary: `postgresql://${host}/${db}`,
      };
    } catch {
      return { engine: "postgres", safeSummary: "postgresql://***" };
    }
  }

  throw new Error(
    "DATABASE_URL must start with file:, postgres:// or postgresql://",
  );
}
