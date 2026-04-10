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

export type MvpFieldSpec = {
  id: string;
  label: string;
  format: string;
};

export type MvpScopeResponse = {
  product: "hotel-booking-mvp";
  contractVersion: string;
  lastUpdated: string;
  explicitNonGoals: string[];
  availability: {
    mode: "simulated";
    summary: string;
    rules: string[];
  };
  reservationRequest: {
    summary: string;
    requiredGuestFields: MvpFieldSpec[];
    requiredStayContextFields: MvpFieldSpec[];
    optionalFields: MvpFieldSpec[];
  };
  operationalFlow: {
    summary: string;
    leadHandling: string[];
  };
};
