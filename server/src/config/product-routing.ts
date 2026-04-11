/**
 * Convivencia Ficha Cliente (H2-FC) vs flujo MVP reservas hoteles.
 * Fuente de verdad para prefijos API, naming en UI y home compartida.
 */

export type ProductRoutingPolicy = {
  version: "1.0";
  updated: string;
  api: {
    /** Todas las APIs REST del BFF comparten este prefijo (sin segundo árbol /v2 solo por hoteles). */
    restPrefix: string;
    /** Recursos del MVP hoteles (mismo prefijo que el resto del BFF). */
    hotels: { searchAndList: string; detailPattern: string; bookingRequests: string };
    /** Recursos de Ficha Cliente: rutas distintas por nombre de recurso (no mezclar con /hotels). */
    fichaCliente: {
      /** Convención para endpoints de dominio cliente cuando existan en el BFF. */
      resourcePrefix: string;
      note: string;
    };
  };
  frontend: {
    /** Una sola SPA; la home es compartida (entrada única a la app). */
    sharedHome: boolean;
    /** Rutas sugeridas del cliente (React Router u otro). No son del BFF. */
    pathPrefixes: { fichaCliente: string; hotelsMvp: string };
    /** Naming en UI: marca shell vs sección hoteles. */
    uiNaming: { shellTitle: string; hotelsSection: string };
  };
};

export const PRODUCT_ROUTING_POLICY: ProductRoutingPolicy = {
  version: "1.0",
  updated: "2026-04-11T00:00:00.000Z",
  api: {
    restPrefix: "/v1",
    hotels: {
      searchAndList: "/v1/hotels",
      detailPattern: "/v1/hotels/:hotelId",
      bookingRequests: "/v1/booking-requests",
    },
    fichaCliente: {
      resourcePrefix: "/v1/clients",
      note:
        "Los endpoints de ficha/datos de cliente vivirán bajo /v1/clients (u otro recurso explícito), nunca bajo /v1/hotels.",
    },
  },
  frontend: {
    sharedHome: true,
    pathPrefixes: {
      fichaCliente: "/",
      hotelsMvp: "/app/hotels",
    },
    uiNaming: {
      shellTitle: "Ficha Cliente",
      hotelsSection: "Reservas hoteles",
    },
  },
};
