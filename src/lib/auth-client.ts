import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
// ★ REQUIREMENT UPDATE (JWT): this client plugin lets the browser call
// the JWT plugin's endpoints (for example /token and /jwks) through
// authClient, with correct TypeScript types.
import { jwtClient } from "better-auth/client/plugins";
// Type-only import: TypeScript erases this at build time, so the
// server-side auth file (with the MongoDB connection) is NEVER
// loaded in the browser — we only borrow its types.
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000",
  baseURL: process.env.BETTER_AUTH_URL,
  // Tells TypeScript about our custom user fields (role, plan, phone, bio)
  // so authClient.signUp.email({ role: "tutor" }) type-checks correctly.
  // jwtClient() must be paired with the server's jwt() plugin in src/lib/auth.ts.
  plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],
});

// export const { signIn, signUp, useSession } = createAuthClient();
