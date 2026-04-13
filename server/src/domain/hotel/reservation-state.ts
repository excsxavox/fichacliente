/**
 * Ciclo de vida de una reserva.
 * Estados terminales: checked_out, cancelled, no_show.
 */
export const RESERVATION_STATES = [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "no_show",
] as const;
export type ReservationState = (typeof RESERVATION_STATES)[number];

const TERMINAL: ReadonlySet<ReservationState> = new Set([
  "checked_out",
  "cancelled",
  "no_show",
]);

/**
 * Transiciones permitidas (MVP). Cualquier par (from→to) no contemplado aquí
 * se considera prohibido salvo from === to (idempotencia).
 *
 * - pending → confirmed | cancelled
 * - confirmed → checked_in | cancelled | no_show
 * - checked_in → checked_out
 * - Estados terminales: sin salidas
 *
 * Prohibido explícitamente (ejemplos):
 * - Saltar confirmed (pending → checked_in).
 * - Reactivar desde cancelled / no_show / checked_out.
 * - checked_in → cancelled (cancelación con huésped dentro: fuera de alcance MVP;
 *   usar flujos posteriores o check-out operativo).
 */
export const RESERVATION_ALLOWED_TRANSITIONS: Readonly<
  Record<ReservationState, readonly ReservationState[]>
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
  no_show: [],
} as const;

export function isTerminalReservationState(state: ReservationState): boolean {
  return TERMINAL.has(state);
}

export function isValidReservationTransition(
  from: ReservationState,
  to: ReservationState,
): boolean {
  if (from === to) return true;
  return RESERVATION_ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertValidReservationTransition(
  from: ReservationState,
  to: ReservationState,
): void {
  if (isValidReservationTransition(from, to)) return;
  throw new Error(`INVALID_RESERVATION_TRANSITION:${from}->${to}`);
}
