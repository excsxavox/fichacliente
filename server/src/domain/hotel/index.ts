export {
  ROOM_STATES,
  ROOM_ALLOWED_TRANSITIONS,
  type RoomState,
  isValidRoomTransition,
  assertValidRoomTransition,
} from "./room-state.js";
export {
  RESERVATION_STATES,
  RESERVATION_ALLOWED_TRANSITIONS,
  type ReservationState,
  isTerminalReservationState,
  isValidReservationTransition,
  assertValidReservationTransition,
} from "./reservation-state.js";
export { getHotelStateMatrixPayload } from "./state-matrix-meta.js";
