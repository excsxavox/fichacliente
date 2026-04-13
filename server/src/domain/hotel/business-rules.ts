import type { ReservationState } from "./reservation-state.js";

/** Códigos estables para el cliente; usar con HTTP 409 en capa HTTP. */
export const BusinessErrorCode = {
  RESERVATION_ALREADY_CANCELLED: "RESERVATION_ALREADY_CANCELLED",
  RESERVATION_ALREADY_CHECKED_IN: "RESERVATION_ALREADY_CHECKED_IN",
  RESERVATION_ALREADY_CHECKED_OUT: "RESERVATION_ALREADY_CHECKED_OUT",
  RESERVATION_CANCEL_INVALID_STATE: "RESERVATION_CANCEL_INVALID_STATE",
  RESERVATION_NO_SHOW_INVALID_STATE: "RESERVATION_NO_SHOW_INVALID_STATE",
  RESERVATION_NO_SHOW_TOO_EARLY: "RESERVATION_NO_SHOW_TOO_EARLY",
  RESERVATION_ROOM_CHANGE_NOT_ALLOWED: "RESERVATION_ROOM_CHANGE_NOT_ALLOWED",
  RESERVATION_ROOM_CHANGE_OVERLAP: "RESERVATION_ROOM_CHANGE_OVERLAP",
} as const;

export type BusinessErrorCode = (typeof BusinessErrorCode)[keyof typeof BusinessErrorCode];

export type RuleResult<T = void> =
  | { ok: true; value: T }
  | { ok: false; code: BusinessErrorCode; message: string };

function fail(code: BusinessErrorCode, message: string): RuleResult<never> {
  return { ok: false, code, message };
}

/**
 * Cancelación (MVP): pending→cancelled, confirmed→cancelled.
 * No desde checked_in / checked_out / terminales (alineado con reservation-state).
 */
export function evaluateCancellation(
  current: ReservationState,
): RuleResult<ReservationState> {
  if (current === "pending" || current === "confirmed") {
    return { ok: true, value: "cancelled" };
  }
  if (current === "cancelled") {
    return fail(
      BusinessErrorCode.RESERVATION_ALREADY_CANCELLED,
      "La reserva ya está cancelada.",
    );
  }
  if (current === "checked_in") {
    return fail(
      BusinessErrorCode.RESERVATION_ALREADY_CHECKED_IN,
      "No se puede cancelar con check-in registrado (MVP); requiere flujo operativo posterior o check-out.",
    );
  }
  if (current === "checked_out") {
    return fail(
      BusinessErrorCode.RESERVATION_ALREADY_CHECKED_OUT,
      "La estancia ya finalizó; la cancelación no aplica.",
    );
  }
  if (current === "no_show") {
    return fail(
      BusinessErrorCode.RESERVATION_CANCEL_INVALID_STATE,
      "La reserva figura como no-show; no se aplica cancelación estándar.",
    );
  }
  return fail(
    BusinessErrorCode.RESERVATION_CANCEL_INVALID_STATE,
    "No se puede cancelar desde el estado actual de la reserva.",
  );
}

export type IsoDateString = string;

/**
 * No-show (MVP): solo confirmed→no_show; no antes del día de entrada.
 * `today` debe alinearse con la zona horaria de la propiedad cuando exista en el modelo.
 */
export function evaluateNoShow(
  current: ReservationState,
  stayCheckInDate: IsoDateString,
  today: IsoDateString,
): RuleResult<ReservationState> {
  if (current === "pending") {
    return fail(
      BusinessErrorCode.RESERVATION_NO_SHOW_INVALID_STATE,
      "Confirme la reserva antes de marcar no-show.",
    );
  }
  if (current !== "confirmed") {
    if (current === "cancelled") {
      return fail(
        BusinessErrorCode.RESERVATION_ALREADY_CANCELLED,
        "No se marca no-show sobre una reserva cancelada.",
      );
    }
    if (current === "checked_in") {
      return fail(
        BusinessErrorCode.RESERVATION_ALREADY_CHECKED_IN,
        "El huésped ya tiene check-in; no-show no aplica.",
      );
    }
    if (current === "checked_out") {
      return fail(
        BusinessErrorCode.RESERVATION_ALREADY_CHECKED_OUT,
        "La estancia finalizó; no-show no aplica.",
      );
    }
    if (current === "no_show") {
      return fail(
        BusinessErrorCode.RESERVATION_NO_SHOW_INVALID_STATE,
        "La reserva ya está marcada como no-show.",
      );
    }
    return fail(
      BusinessErrorCode.RESERVATION_NO_SHOW_INVALID_STATE,
      "No-show solo aplica a reservas confirmadas antes del check-in.",
    );
  }
  if (today < stayCheckInDate) {
    return fail(
      BusinessErrorCode.RESERVATION_NO_SHOW_TOO_EARLY,
      "No-show no puede registrarse antes de la fecha de entrada acordada.",
    );
  }
  return { ok: true, value: "no_show" };
}

/**
 * Cambio de habitación (MVP): solo antes del check-in — estados pending o confirmed.
 * Solape en la nueva unidad: capa de persistencia → RESERVATION_ROOM_CHANGE_OVERLAP.
 */
export function evaluateRoomChangeAllowed(current: ReservationState): RuleResult<void> {
  if (current === "pending" || current === "confirmed") {
    return { ok: true, value: undefined };
  }
  if (current === "cancelled" || current === "no_show") {
    return fail(
      BusinessErrorCode.RESERVATION_ROOM_CHANGE_NOT_ALLOWED,
      "No se reasigna habitación en reservas canceladas o marcadas como no-show.",
    );
  }
  return fail(
    BusinessErrorCode.RESERVATION_ROOM_CHANGE_NOT_ALLOWED,
    "El cambio de habitación en MVP solo está permitido antes del check-in (pending o confirmed).",
  );
}

/** Contrato para clientes y documentación (sin PII). */
export function getHotelBusinessRulesContract() {
  return {
    version: 1 as const,
    reservationStatesReference: "See GET /v1/hotel/state-matrix for full transition matrix.",
    cancellation: {
      purpose: "Anular la reserva antes del check-in.",
      allowedFrom: ["pending", "confirmed"] as const,
      resultingState: "cancelled" as const,
      httpConflictCodes: [
        BusinessErrorCode.RESERVATION_ALREADY_CANCELLED,
        BusinessErrorCode.RESERVATION_ALREADY_CHECKED_IN,
        BusinessErrorCode.RESERVATION_ALREADY_CHECKED_OUT,
        BusinessErrorCode.RESERVATION_CANCEL_INVALID_STATE,
      ],
    },
    noShow: {
      purpose: "Registrar que el huésped no se presentó tras la fecha de entrada.",
      allowedFrom: ["confirmed"] as const,
      resultingState: "no_show" as const,
      preconditions: [
        "today (zona de la propiedad) >= stayCheckInDate",
        "Estado confirmed",
      ],
      httpConflictCodes: [
        BusinessErrorCode.RESERVATION_ALREADY_CANCELLED,
        BusinessErrorCode.RESERVATION_ALREADY_CHECKED_IN,
        BusinessErrorCode.RESERVATION_ALREADY_CHECKED_OUT,
        BusinessErrorCode.RESERVATION_NO_SHOW_INVALID_STATE,
        BusinessErrorCode.RESERVATION_NO_SHOW_TOO_EARLY,
      ],
    },
    roomChange: {
      purpose: "Reasignar la habitación física manteniendo el mismo rango de fechas de la reserva.",
      allowedFrom: ["pending", "confirmed"] as const,
      persistenceOverlapCode: BusinessErrorCode.RESERVATION_ROOM_CHANGE_OVERLAP,
      httpConflictCodes: [
        BusinessErrorCode.RESERVATION_ROOM_CHANGE_NOT_ALLOWED,
        BusinessErrorCode.RESERVATION_ROOM_CHANGE_OVERLAP,
      ],
    },
    businessErrorCodes: BusinessErrorCode,
  } as const;
}
