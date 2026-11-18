import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
// Type-only import: TypeScript erases this at build time, so the
// server-side auth file (with the MongoDB connection) is NEVER
// loaded in the browser — we only borrow its types.
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
  // Tells TypeScript about our custom user fields (role, plan, phone, bio)
  // so authClient.signUp.email({ role: "tutor" }) type-checks correctly
  plugins: [inferAdditionalFields<typeof auth>()],
});

// export const { signIn, signUp, useSession } = createAuthClient();
