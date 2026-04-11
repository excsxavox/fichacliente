import { fetchJson } from "./client";
import type { ProductRoutingResponse } from "./types";

export function loadProductRouting(): Promise<ProductRoutingResponse> {
  return fetchJson<ProductRoutingResponse>("/v1/meta/product-routing");
}
