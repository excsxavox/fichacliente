import { fetchJson } from "../../api/client";
import type { MvpScopeResponse } from "../../api/types";

export function fetchMvpScope(): Promise<MvpScopeResponse> {
  return fetchJson<MvpScopeResponse>("/v1/meta/mvp-scope");
}
