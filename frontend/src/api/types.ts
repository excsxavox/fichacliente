export type HealthResponse = {
  status: string;
  service: string;
  environment: string;
};

export type StackMetaResponse = {
  repository: string;
  runtime: string;
  language: string;
  framework: string;
  apiPrefix: string;
  notes: string[];
};
