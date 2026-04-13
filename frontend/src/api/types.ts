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
