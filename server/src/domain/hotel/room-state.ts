/**
 * Estado operativo de una habitación (unidad física reservable).
 * Nombres en inglés en código; semántica alineada con gestión hotelera.
 */
export const ROOM_STATES = ["available", "occupied", "blocked"] as const;
export type RoomState = (typeof ROOM_STATES)[number];

/**
 * Transiciones permitidas: clave = estado origen, valor = destinos válidos.
 *
 * Semántica:
 * - available → occupied: check-in asigna la habitación a una reserva en estancia.
 * - occupied → available: check-out libera la unidad.
 * - available ↔ blocked: sacar o devolver inventario (mantenimiento, fuera de servicio).
 *
 * Prohibido explícitamente (no aparece como destino):
 * - occupied → blocked: debe hacerse check-out (occupied → available) antes de bloquear.
 * - blocked → occupied: debe volver a available antes de ocupar.
 * - Cualquier transición desde/hacia un estado no listado aquí.
 */
export const ROOM_ALLOWED_TRANSITIONS: Readonly<
  Record<RoomState, readonly RoomState[]>
> = {
  available: ["occupied", "blocked"],
  occupied: ["available"],
  blocked: ["available"],
} as const;

export function isValidRoomTransition(from: RoomState, to: RoomState): boolean {
  if (from === to) return true;
  return ROOM_ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertValidRoomTransition(from: RoomState, to: RoomState): void {
  if (isValidRoomTransition(from, to)) return;
  throw new Error(`INVALID_ROOM_TRANSITION:${from}->${to}`);
}
