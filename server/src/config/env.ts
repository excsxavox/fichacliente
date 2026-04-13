import { z } from "zod";
import { parseDatabaseUrl } from "../persistence/database-url.js";
import type { ParsedDatabaseUrl } from "../persistence/database-url.js";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  /**
   * Persistencia MVP: por defecto SQLite local (`file:./data/hotel.db`).
   * Postgres: `postgresql://user:pass@host:5432/dbname`.
   */
  DATABASE_URL: z
    .string()
    .optional()
    .default("file:./data/hotel.db")
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: "DATABASE_URL cannot be empty" }),
  AFFINITY_API_BASE_URL: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .refine((v) => v === "" || /^https?:\/\//i.test(v), {
      message: "Must be empty or absolute http(s) URL",
    }),
  AFFINITY_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  DOCUMENT_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

export type AppEnv = z.infer<typeof envSchema> & {
  persistence: ParsedDatabaseUrl;
};

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function loadEnv(processEnv: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.safeParse(processEnv);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment configuration: ${JSON.stringify(msg)}`);
  }
  const base = parsed.data.AFFINITY_API_BASE_URL?.trim() ?? "";
  let persistence: ParsedDatabaseUrl;
  try {
    persistence = parseDatabaseUrl(parsed.data.DATABASE_URL);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid DATABASE_URL: ${message}`);
  }
  return {
    ...parsed.data,
    AFFINITY_API_BASE_URL: base ? stripTrailingSlash(base) : "",
    persistence,
  };
}
