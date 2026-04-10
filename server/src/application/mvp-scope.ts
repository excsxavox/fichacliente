/**
 * Contrato de producto MVP (cadena de hoteles — solicitud de reserva sin pago).
 * Fuente única para metadatos expuestos en GET /v1/meta/mvp-scope.
 */

export type MvpScopeSnapshot = {
  product: "hotel-booking-mvp";
  /** Versión semántica del contrato de este documento JSON (no de la app). */
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
    /** Campos mínimos del huésped en el formulario (PII). */
    requiredGuestFields: Array<{
      id: string;
      label: string;
      format: string;
    }>;
    /** Contexto de la estancia requerido para vincular la solicitud al catálogo. */
    requiredStayContextFields: Array<{
      id: string;
      label: string;
      format: string;
    }>;
    optionalFields: Array<{
      id: string;
      label: string;
      format: string;
    }>;
  };
  operationalFlow: {
    summary: string;
    leadHandling: string[];
  };
};

export function buildMvpScopeSnapshot(): MvpScopeSnapshot {
  return {
    product: "hotel-booking-mvp",
    contractVersion: "1.0.0",
    lastUpdated: "2026-04-10",
    explicitNonGoals: [
      "Sin pago online ni pasarela de cobro en el MVP.",
      "Sin cuentas de usuario, login ni perfiles persistentes de huésped.",
      "Sin integración con PMS, channel manager ni OTAs.",
      "Sin precios dinámicos reales ni motor de revenue management; los importes mostrados serán estáticos o ilustrativos del catálogo semilla.",
      "Sin garantía de disponibilidad real ni bloqueo de inventario frente a otros canales.",
      "Sin envío de correo/SMS transaccional obligatorio en el MVP (la referencia de solicitud es el correlato principal).",
    ],
    availability: {
      mode: "simulated",
      summary:
        "La disponibilidad frente a fechas es simulada: se valida coherencia de fechas y reglas de negocio básicas, pero no hay inventario en tiempo real.",
      rules: [
        "Los resultados de búsqueda se basan en el catálogo semilla (hoteles y habitaciones) y en reglas simuladas, no en ocupación real.",
        "Una solicitud aceptada por la API no implica confirmación de reserva ni preasignación física de habitación.",
        "Colisiones de capacidad entre solicitudes no se modelan como en un PMS; el backend puede limitarse a persistir el lead y devolver una referencia.",
      ],
    },
    reservationRequest: {
      summary:
        "Formulario de solicitud sin pago: captura datos mínimos del huésped y el contexto de estancia para crear un lead versionable vía POST /v1 (ruta concreta en iteración posterior).",
      requiredGuestFields: [
        {
          id: "guest.fullName",
          label: "Nombre y apellidos del huésped principal",
          format: "string no vacío, sin validación de documento en el MVP",
        },
        {
          id: "guest.email",
          label: "Correo electrónico de contacto",
          format: "string con formato email (validación en borde HTTP)",
        },
        {
          id: "guest.phone",
          label: "Teléfono de contacto",
          format: "string no vacío; se recomienda E.164 en iteraciones posteriores, MVP admite texto libre acotado en longitud",
        },
      ],
      requiredStayContextFields: [
        {
          id: "stay.hotelId",
          label: "Hotel seleccionado",
          format: "identificador estable del catálogo semilla",
        },
        {
          id: "stay.roomId",
          label: "Habitación o tipo de habitación objetivo",
          format: "identificador estable del catálogo semilla",
        },
        {
          id: "stay.checkIn",
          label: "Fecha de entrada",
          format: "fecha calendario ISO 8601 (YYYY-MM-DD)",
        },
        {
          id: "stay.checkOut",
          label: "Fecha de salida",
          format: "fecha calendario ISO 8601 (YYYY-MM-DD), estrictamente posterior a checkIn",
        },
      ],
      optionalFields: [
        {
          id: "stay.specialRequests",
          label: "Peticiones especiales",
          format: "string opcional, longitud acotada en validación de borde",
        },
        {
          id: "stay.guestCount",
          label: "Número de huéspedes",
          format: "entero positivo opcional; por defecto puede asumirse 1 si no se envía",
        },
      ],
    },
    operationalFlow: {
      summary:
        "El MVP trata cada envío como un lead de reserva; el consumo operativo (CRM, bandeja interna, email staff) queda fuera del alcance técnico mínimo pero la API debe devolver una referencia correlacionable.",
      leadHandling: [
        "Persistencia del lead: memoria, fichero o base de datos según decisión de infraestructura (tarea de flujo aparte).",
        "La UI muestra al usuario la referencia devuelta como confirmación de recepción, no como voucher confirmado.",
      ],
    },
  };
}
