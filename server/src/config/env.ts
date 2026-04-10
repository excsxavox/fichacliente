import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default("info"),
  AFFINITY_API_BASE_URL: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().url().optional(),
  ),
  AFFINITY_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  DOCUMENT_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

export type AppEnv = z.infer<typeof schema>;

export function loadEnv(): AppEnv {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
}
