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

/** GET /v1/meta/product-routing — convivencia Ficha Cliente / MVP hoteles */
export type ProductRoutingResponse = {
  version: string;
  updated: string;
  api: {
    restPrefix: string;
    hotels: {
      searchAndList: string;
      detailPattern: string;
      bookingRequests: string;
    };
    fichaCliente: {
      resourcePrefix: string;
      note: string;
    };
  };
  frontend: {
    sharedHome: boolean;
    pathPrefixes: {
      fichaCliente: string;
      hotelsMvp: string;
    };
    uiNaming: {
      shellTitle: string;
      hotelsSection: string;
    };
  };
};
