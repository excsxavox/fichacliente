/**
 * Casos de demo MVP hotelero — una sola sesión narrativa con datos de ejemplo
 * y flujo API de punta a punta (contratos previstos; implementación en iteraciones posteriores).
 */

export type DemoHttpStep = {
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
    /** Códigos de error de negocio o de envelope `error.code` cuando aplique */
    errorCodes?: string[];
  };
};

export type HotelMvpDemoSessionPayload = {
  id: "hotel-mvp-demo-session-v1";
  version: 1;
  locale: "es";
  /** Fecha de referencia del guion (check-in “hoy” simulado, etc.) */
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
      /** Alineado con `RESERVATION_STATES` en dominio */
      state: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show";
    }>;
  };
  steps: DemoHttpStep[];
};

const ACTOR_STAFF = "11111111-1111-4111-8111-111111111111";
const ACTOR_ANA = "22222222-2222-4222-8222-222222222222";
const ACTOR_LUIS = "33333333-3333-4333-8333-333333333333";

const PROP_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ROOM_101 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1";
const ROOM_102 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2";
const RES_ANA = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const RES_LUIS = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

export function getHotelMvpDemoSession(): HotelMvpDemoSessionPayload {
  return {
    id: "hotel-mvp-demo-session-v1",
    version: 1,
    locale: "es",
    referenceDate: "2026-04-13",
    narrative:
      "En una sola sesión, el personal del hotel da de alta la propiedad y habitaciones, crea la reserva de Ana en pending, la confirma, hace check-in y check-out, y demuestra el rechazo de una segunda reserva que solapa en la misma habitación física.",
    assumptions: [
      "Todas las fechas de estancia son calendario local de la propiedad (IANA en `timezone`).",
      "Una habitación es la unidad física reservable; el cambio de habitación implica liberar la anterior y ocupar otra con disponibilidad.",
      "Hasta JWT, el cliente envía `x-actor-id` (UUID) como actor autenticado simulado.",
      "Los endpoints de dominio hotelero se publicarán bajo `/v1`; este documento usa rutas previstas.",
    ],
    glossary: {
      property: "Establecimiento hotelero (una fila en `properties`).",
      room: "Habitación física reservable (`rooms`), pertenece a una propiedad.",
      reservation: "Reserva (`reservations`) con rango [check_in_date, check_out_date) y estado.",
      overlap:
        "Dos reservas en la misma `room_id` con rangos de fechas que se intersectan (límites según reglas de negocio acordadas).",
    },
    seed: {
      actorIds: { staff: ACTOR_STAFF, guestAna: ACTOR_ANA, guestLuis: ACTOR_LUIS },
      property: {
        id: PROP_ID,
        name: "Hotel Demo Mar (MVP)",
        timezone: "Europe/Madrid",
        addressLine: "Calle Ficticia 123, 28001 Madrid",
      },
      rooms: [
        { id: ROOM_101, code: "101", capacity: 2, floor: 1 },
        { id: ROOM_102, code: "102", capacity: 1, floor: 1 },
      ],
      reservations: [
        {
          id: RES_ANA,
          roomId: ROOM_101,
          guestActorId: ACTOR_ANA,
          checkInDate: "2026-04-20",
          checkOutDate: "2026-04-23",
          state: "pending",
        },
        {
          id: RES_LUIS,
          roomId: ROOM_102,
          guestActorId: ACTOR_LUIS,
          checkInDate: "2026-04-21",
          checkOutDate: "2026-04-22",
          state: "pending",
        },
      ],
    },
    steps: [
      {
        step: 1,
        title: "Alta de propiedad",
        purpose: "Registrar la propiedad donde cuelgan habitaciones y reservas.",
        request: {
          method: "POST",
          path: "/v1/properties",
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: {
            name: "Hotel Demo Mar (MVP)",
            timezone: "Europe/Madrid",
            addressLine: "Calle Ficticia 123, 28001 Madrid",
          },
        },
        expected: {
          status: 201,
          responseSummary:
            "JSON con `id`, `name`, `timezone`, `addressLine`, `createdAt` (u campos equivalentes acordados en el contrato).",
        },
      },
      {
        step: 2,
        title: "Alta de habitaciones",
        purpose: "Crear unidades físicas 101 (doble) y 102 (individual).",
        request: {
          method: "POST",
          path: `/v1/properties/${PROP_ID}/rooms`,
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: { code: "101", capacity: 2, floor: 1 },
        },
        expected: {
          status: 201,
          responseSummary: "JSON con `id`, `propertyId`, `code`, `capacity`, `floor`, estado de habitación si aplica.",
        },
      },
      {
        step: 3,
        title: "Segunda habitación (misma propiedad)",
        purpose: "Completar el inventario mínimo para demos de ocupación y solapes.",
        request: {
          method: "POST",
          path: `/v1/properties/${PROP_ID}/rooms`,
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: { code: "102", capacity: 1, floor: 1 },
        },
        expected: { status: 201, responseSummary: "Igual que paso 2 con `code` 102." },
      },
      {
        step: 4,
        title: "Crear reserva de Ana (hab. 101)",
        purpose: "Alta en estado `pending` (20→23 abr) sin solape previo.",
        request: {
          method: "POST",
          path: "/v1/reservations",
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: {
            propertyId: PROP_ID,
            roomId: ROOM_101,
            guestActorId: ACTOR_ANA,
            checkInDate: "2026-04-20",
            checkOutDate: "2026-04-23",
          },
        },
        expected: {
          status: 201,
          responseSummary:
            "JSON con `id`, fechas, `roomId`, `guestActorId`, `state: pending` (MVP: check-in exige `confirmed` antes).",
        },
      },
      {
        step: 5,
        title: "Confirmar reserva",
        purpose: "Transición `pending → confirmed` (requerida antes del check-in en la matriz MVP).",
        request: {
          method: "POST",
          path: `/v1/reservations/${RES_ANA}/confirm`,
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: {},
        },
        expected: {
          status: 200,
          responseSummary: "Reserva con `state: confirmed`.",
        },
      },
      {
        step: 6,
        title: "Consultar reserva",
        purpose: "Ver detalle idempotente para front y soporte.",
        request: {
          method: "GET",
          path: `/v1/reservations/${RES_ANA}`,
          headers: { "x-actor-id": ACTOR_STAFF },
        },
        expected: {
          status: 200,
          responseSummary: "Mismo shape que creación; incluye `state` y metadatos de auditoría si existen.",
        },
      },
      {
        step: 7,
        title: "Check-in",
        purpose: "Transición `confirmed → checked_in` el día de entrada (zona horaria de la propiedad).",
        request: {
          method: "POST",
          path: `/v1/reservations/${RES_ANA}/check-in`,
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: {},
        },
        expected: {
          status: 200,
          responseSummary:
            "Reserva con `state: checked_in`; habitación física alineada con estados `available` / `occupied` según matriz.",
        },
      },
      {
        step: 8,
        title: "Check-out",
        purpose: "Transición `checked_in → checked_out` y liberación de la habitación para nuevos rangos.",
        request: {
          method: "POST",
          path: `/v1/reservations/${RES_ANA}/check-out`,
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: {},
        },
        expected: {
          status: 200,
          responseSummary: "Reserva `checked_out`; la 101 vuelve a estar disponible en rangos futuros.",
        },
      },
      {
        step: 9,
        title: "Intento de reserva solapada (conflicto)",
        purpose: "Demostrar rechazo atómico ante solape en la misma habitación física.",
        request: {
          method: "POST",
          path: "/v1/reservations",
          headers: { "x-actor-id": ACTOR_STAFF, "content-type": "application/json" },
          body: {
            propertyId: PROP_ID,
            roomId: ROOM_101,
            guestActorId: ACTOR_LUIS,
            checkInDate: "2026-04-21",
            checkOutDate: "2026-04-24",
          },
        },
        expected: {
          status: 409,
          responseSummary:
            "Envelope `{ error: { code, message } }` sin stack. Solape en persistencia: alinear con `RESERVATION_ROOM_CHANGE_OVERLAP` o código dedicado de solape de estancia cuando exista.",
          errorCodes: ["RESERVATION_ROOM_CHANGE_OVERLAP"],
        },
      },
      {
        step: 10,
        title: "Listado de habitaciones (contexto UI)",
        purpose: "Alimentar pantallas de inventario y filtros por propiedad.",
        request: {
          method: "GET",
          path: `/v1/properties/${PROP_ID}/rooms`,
          headers: { "x-actor-id": ACTOR_STAFF },
          query: { limit: "50", offset: "0" },
        },
        expected: {
          status: 200,
          responseSummary: "Lista paginada: `items[]` con `id`, `code`, `capacity`, `state` (habitación), `propertyId`.",
        },
      },
    ],
  };
}
