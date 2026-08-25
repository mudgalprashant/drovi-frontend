import { firebaseAuth } from "@/lib/auth/firebase";
import type { ApiErrorBody } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * A failure the API described, as opposed to the network failing.
 *
 * Carries the correlation id because that is what makes a support conversation short — the
 * backend puts one in every error body and in the `X-Correlation-Id` header, and it is the
 * string that finds the server-side logs for exactly this request.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly correlationId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** 401 means the token is gone or rejected, and the whole session is suspect. */
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }
}

/**
 * One place every console request goes through.
 *
 * <p>Three things it does that a bare `fetch` at each call site would eventually get wrong:
 * attaches a *fresh* ID token, turns the API's error envelope into a typed failure instead of an
 * unhelpful "Failed to fetch", and preserves the correlation id.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Through the SDK, never by hand. It refreshes an expired token transparently; caching one
  // ourselves means a user who left a tab open sees a spurious sign-out an hour later.
  const token = await firebaseAuth().currentUser?.getIdToken();

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch (cause) {
    // A browser reports a blocked preflight as an indistinguishable network error, and that is
    // by far the likeliest cause here — so the message says so rather than leaving someone to
    // wonder whether the backend is down.
    throw new ApiError(
      0,
      "NETWORK",
      "Could not reach the API. If this is a new deployment, its origin may not be in the " +
        "backend's DROVI_CONSOLE_ORIGINS.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const correlationId = response.headers.get("X-Correlation-Id") ?? undefined;
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = body as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      envelope?.error?.code ?? "UNKNOWN",
      envelope?.error?.message ?? `The API returned ${response.status}.`,
      envelope?.error?.correlationId ?? correlationId,
    );
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
