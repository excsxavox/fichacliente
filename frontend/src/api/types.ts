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

/** GET /v1/meta/persistence — motor efectivo y política MVP (sin credenciales). */
export type PersistenceMetaResponse = {
  engine: "sqlite" | "postgres";
  databaseUrlSummary: string;
  rationale: string[];
  concurrencyMvp: string;
  migrationPathToPostgres: string;
  configuration: {
    databaseUrlVar: string;
    description: string;
  };
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

/** GET /v1/demo/hotel-mvp-session — alineado con `HotelMvpDemoSessionPayload` del servidor. */
export type HotelMvpDemoSessionSeedReservationState =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

export type HotelMvpDemoSessionResponse = {
  id: "hotel-mvp-demo-session-v1";
  version: 1;
  locale: "es";
  referenceDate: string;
  narrative: string;
  assumptions: string[];
  glossary: Record<string, string>;
  seed: {
    actorIds: { staff: string; guestAna: string; guestLuis: string };
    property: {
      id: string;
      name: string;
      timezone: string;
      addressLine: string;
    };
    rooms: Array<{
      id: string;
      code: string;
      capacity: number;
      floor: number;
    }>;
    reservations: Array<{
      id: string;
      roomId: string;
      guestActorId: string;
      checkInDate: string;
      checkOutDate: string;
      state: HotelMvpDemoSessionSeedReservationState;
    }>;
  };
  steps: Array<{
    step: number;
    title: string;
    purpose: string;
    request: {
      method: "GET" | "POST" | "PATCH" | "DELETE";
      path: string;
      headers?: Record<string, string>;
      query?: Record<string, string>;
      body?: unknown;
    };
    expected: {
      status: number;
      responseSummary: string;
      errorCodes?: string[];
    };
  }>;
};
