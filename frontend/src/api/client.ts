const DEFAULT_BASE = "";

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_BASE;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  const rid = crypto.randomUUID();
  headers.set("x-request-id", rid);

  const res = await fetch(url, { ...init, headers });
  const requestId = res.headers.get("x-request-id") ?? rid;

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body?.error?.message) detail = body.error.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail, requestId);
  }

  return (await res.json()) as T;
}

export class ApiError extends Error {
  readonly status: number;
  readonly requestId: string;

  constructor(status: number, message: string, requestId: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
  }
}
