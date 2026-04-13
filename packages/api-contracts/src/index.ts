import { z } from "zod";

/** Respuesta de `GET /health` (BFF). */
export const healthResponseSchema = z.object({
  status: z.string(),
  service: z.string(),
  environment: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

/** Respuesta de `GET /v1/meta/stack` (metadatos y notas de arquitectura). */
export const stackMetaResponseSchema = z.object({
  repository: z.string(),
  runtime: z.string(),
  language: z.string(),
  framework: z.string(),
  apiPrefix: z.string(),
  notes: z.array(z.string()),
});

export type StackMetaResponse = z.infer<typeof stackMetaResponseSchema>;

export function parseHealthResponse(data: unknown): HealthResponse {
  return healthResponseSchema.parse(data);
}

export function parseStackMetaResponse(data: unknown): StackMetaResponse {
  return stackMetaResponseSchema.parse(data);
}
