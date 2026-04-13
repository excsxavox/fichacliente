import {
  RESERVATION_ALLOWED_TRANSITIONS,
  RESERVATION_STATES,
  type ReservationState,
} from "./reservation-state.js";
import {
  ROOM_ALLOWED_TRANSITIONS,
  ROOM_STATES,
  type RoomState,
} from "./room-state.js";

function pairsForStates<T extends string>(
  states: readonly T[],
  isAllowed: (from: T, to: T) => boolean,
): { allowed: [T, T][]; forbidden: [T, T][] } {
  const allowed: [T, T][] = [];
  const forbidden: [T, T][] = [];
  for (const from of states) {
    for (const to of states) {
      if (from === to) continue;
      const ok = isAllowed(from, to);
      if (ok) allowed.push([from, to]);
      else forbidden.push([from, to]);
    }
  }
  return { allowed, forbidden };
}

function roomTransitionAllowed(from: RoomState, to: RoomState): boolean {
  return ROOM_ALLOWED_TRANSITIONS[from].includes(to);
}

function reservationTransitionAllowed(
  from: ReservationState,
  to: ReservationState,
): boolean {
  return RESERVATION_ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Carga útil estable para documentación y clientes (p. ej. diagramas UI).
 * Las transiciones "permitidas" listan solo cambios de estado (excluye idempotencia same→same).
 */
export function getHotelStateMatrixPayload() {
  const room = pairsForStates(ROOM_STATES, roomTransitionAllowed);
  const reservation = pairsForStates(RESERVATION_STATES, reservationTransitionAllowed);
  return {
    version: 1 as const,
    room: {
      states: [...ROOM_STATES],
      allowedTransitions: room.allowed.map(([from, to]) => ({ from, to })),
      forbiddenTransitions: room.forbidden.map(([from, to]) => ({ from, to })),
      notes: [
        "occupied→blocked and blocked→occupied are forbidden; use occupied→available or blocked→available first.",
      ],
    },
    reservation: {
      states: [...RESERVATION_STATES],
      terminalStates: RESERVATION_STATES.filter(
        (s) => RESERVATION_ALLOWED_TRANSITIONS[s].length === 0,
      ),
      allowedTransitions: reservation.allowed.map(([from, to]) => ({ from, to })),
      forbiddenTransitions: reservation.forbidden.map(([from, to]) => ({ from, to })),
      notes: [
        "No skipping pending→confirmed before checked_in.",
        "No reactivation from terminal states in MVP.",
        "checked_in→cancelled is out of scope for MVP.",
      ],
    },
  };
}
