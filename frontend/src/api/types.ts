export type HealthResponse = {
  status: string;
  service: string;
  environment: string;
};

export type MvpReservationDecision = {
  choice: "A" | "B" | "C";
  label: string;
  actaRelativePath: string;
};

export type StackMetaResponse = {
  repository: string;
  runtime: string;
  language: string;
  framework: string;
  apiPrefix: string;
  mvpReservationDecision?: MvpReservationDecision;
  notes: string[];
};
