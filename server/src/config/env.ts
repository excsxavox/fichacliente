import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
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

export type AppEnv = z.infer<typeof envSchema>;

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
  return {
    ...parsed.data,
    AFFINITY_API_BASE_URL: base ? stripTrailingSlash(base) : "",
  };
}
