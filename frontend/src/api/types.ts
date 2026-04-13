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

export type HotelStateTransition = {
  from: string;
  to: string;
};

export type HotelStateMatrixEntity = {
  states: string[];
  allowedTransitions: HotelStateTransition[];
  forbiddenTransitions: HotelStateTransition[];
  notes: string[];
};

export type HotelReservationStateMatrix = HotelStateMatrixEntity & {
  terminalStates: string[];
};

export type HotelStateMatrixResponse = {
  version: number;
  room: HotelStateMatrixEntity;
  reservation: HotelReservationStateMatrix;
};

/** Contrato GET /v1/meta/hotel-business-rules (sin PII). */
export type HotelBusinessRulesResponse = {
  version: number;
  reservationStatesReference: string;
  cancellation: {
    purpose: string;
    allowedFrom: readonly string[];
    resultingState: string;
    httpConflictCodes: readonly string[];
  };
  noShow: {
    purpose: string;
    allowedFrom: readonly string[];
    resultingState: string;
    preconditions: readonly string[];
    httpConflictCodes: readonly string[];
  };
  roomChange: {
    purpose: string;
    allowedFrom: readonly string[];
    persistenceOverlapCode: string;
    httpConflictCodes: readonly string[];
    notes?: readonly string[];
  };
  businessErrorCodes: Record<string, string>;
};
