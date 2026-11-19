import { authClient } from "@/lib/auth-client";

// ============================================================
// Base URL of the Express API (set in .env.local as
// NEXT_PUBLIC_API_URL, e.g. http://localhost:5000)
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================
// apiFetch — the ONE place where the client talks to the
// backend API. Every API function (see tuitions.ts) goes
// through this helper, so auth + error handling live in a
// single spot.
//
// What it does:
//   1. asks BetterAuth "who is logged in?" and gets the
//      session token
//   2. sends the token as  Authorization: Bearer <token>
//      (the Express server verifies it with requireAuth)
//   3. parses the JSON answer
//   4. throws a normal Error with the server's message when
//      the request fails (the page shows it in a toast)
// ============================================================
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // 1) current session (contains the raw session token)
  const { data: sessionData } = await authClient.getSession();
  const token = sessionData?.session?.token;

  // 2) call the API with the token attached
  const res = await fetch(`${API_URL}${path}`, {
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
