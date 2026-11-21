import { authClient } from "@/lib/auth-client";

// ============================================================
// Base URL of the Express API (set in .env.local as
// NEXT_PUBLIC_API_URL, e.g. http://localhost:5000)
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ★ REQUIREMENT UPDATE (JWT):
// We no longer read `session.token` (that was a MongoDB session token).
// Better Auth's JWT plugin gives us a signed JWT from its `/token`
// endpoint. The JWT is the credential sent to the Express backend.
//
// The variable below is an in-memory cache ONLY — it is never written
// to localStorage or a normal cookie. It disappears on page refresh,
// and `getJwtToken()` simply asks Better Auth for a fresh one again.
let cachedJwt: string | null = null;
let cachedJwtExpiresAt = 0; // seconds since Unix epoch

// Read the `exp` claim from the JWT so we know when to refresh it.
// JWTs are three base64url parts separated by dots: header.payload.signature.
function readJwtExpiration(token: string): number {
  try {
    const payloadPart = token.split(".")[1];
    const payload = JSON.parse(atob(payloadPart)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    // If we cannot read it, we simply fetch a new token next time.
    return 0;
  }
}

// Ask Better Auth for the JWT. This endpoint uses the normal session
// cookie, so it only works while the user is signed in.
export async function getJwtToken(): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);

  // Reuse the cached JWT while it is still valid (30s safety margin).
  if (cachedJwt && cachedJwtExpiresAt > now + 30) return cachedJwt;

  try {
    const { data, error } = await authClient.token();
    if (error || !data?.token) return null;

    cachedJwt = data.token;
    cachedJwtExpiresAt = readJwtExpiration(data.token);
    return cachedJwt;
  } catch {
    // No signed-in session → no JWT. Public API routes still work.
    return null;
  }
}

// Call this right after a successful sign-in / sign-up so the JWT is
// already available for the first protected API request.
export async function primeJwtToken(): Promise<void> {
  await getJwtToken();
}

// Call this on sign-out so the in-memory JWT cannot be reused.
export function clearJwtToken(): void {
  cachedJwt = null;
  cachedJwtExpiresAt = 0;
}

// ============================================================
// apiFetch — the ONE place where the client talks to the
// backend API. Every API function (see tuitions.ts) goes
// through this helper, so auth + error handling live in a
// single spot.
//
// What it does:
//   1. gets a signed JWT from Better Auth (or its memory cache)
//   2. sends it as  Authorization: Bearer <jwt>
//      (the Express server verifies the JWT signature + role)
//   3. parses the JSON answer
//   4. throws a normal Error with the server's message when
//      the request fails (the page shows it in a toast)
// ============================================================
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // 1) JWT for protected requests. Public requests simply have none.
  const token = await getJwtToken();

  // 2) call the API with the JWT attached.
  //    cache: "no-store" = the answer is NEVER stored in the
  //    browser's HTTP cache (or a CDN in front of the app), so
  //    after every deployment the dashboards show the NEWEST
  //    data the moment the page opens — no stale numbers.
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // 3) the API always answers with JSON (or null on failure)
  const body = await res.json().catch(() => null);

  // 4) not OK → throw the server's message (e.g. the
  //    "Free plan allows up to 2 tuitions" limit message).
  //    The HTTP status is attached too, so callers can react
  //    to it (the details page shows "not found" on a 404).
  if (!res.ok) {
    const error = new Error(
      (body as { message?: string } | null)?.message ??
        `Request failed (${res.status})`,
    ) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  return body as T;
}
