import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let cachedJwt: string | null = null;
let cachedJwtExpiresAt = 0;

function readJwtExpiration(token: string): number {
  try {
    const payloadPart = token.split(".")[1];
    const payload = JSON.parse(atob(payloadPart)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    return 0;
  }
}

export async function getJwtToken(): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedJwt && cachedJwtExpiresAt > now + 30) return cachedJwt;

  try {
    const { data, error } = await authClient.token();
    if (error || !data?.token) return null;

    cachedJwt = data.token;
    cachedJwtExpiresAt = readJwtExpiration(data.token);
    return cachedJwt;
  } catch {
    return null;
  }
}

export async function primeJwtToken(): Promise<void> {
  await getJwtToken();
}

export function clearJwtToken(): void {
  cachedJwt = null;
  cachedJwtExpiresAt = 0;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getJwtToken();

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

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
