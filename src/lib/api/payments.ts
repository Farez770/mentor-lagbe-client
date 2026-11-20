import { apiFetch } from "./client";

// ============================================================
// Stripe checkout + payment verification
// ============================================================

// The two one-time Pro plans (same ids the checkout route
// understands — the REAL price always comes from the server)
export type CheckoutPlan = "tutor" | "student";

// What /payment/success shows after a verified payment
export type VerifiedPayment = {
  product: "tutor" | "student"; // which plan was bought
  amount: number; // 15 or 10 (whole dollars)
  currency: string; // "usd"
};

// ------------------------------------------------------------
// POST /api/checkout_sessions — a Next.js route on THIS origin,
// so it uses plain fetch instead of apiFetch (apiFetch targets
// the Express API on NEXT_PUBLIC_API_URL). Returns the hosted
// Stripe Checkout URL the browser must navigate to.
// ------------------------------------------------------------
export async function startCheckout(plan: CheckoutPlan, email?: string) {
  const res = await fetch("/api/checkout_sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // plan decides the product; the optional email (typed on
    // /pricing) is where Stripe sends the receipt
    body: JSON.stringify(email ? { plan, email } : { plan }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // 401 sign-in, 400 wrong plan / already pro, 403 admin...
    throw new Error(
      (body as { message?: string } | null)?.message ??
        `Checkout failed (${res.status})`,
    );
  }
  return body as { url: string };
}

// ------------------------------------------------------------
// POST /api/payments/verify — Express endpoint (login required).
// The server asks Stripe about the session; if it is really
// paid it saves the row in "payments" and sets plan: "pro" on
// the user. Called ONCE by the /payment/success page.
// ------------------------------------------------------------
export function verifyPayment(sessionId: string) {
  return apiFetch<{
    message: string; // "Payment verified — you are now Pro!"
    plan: string; // "pro"
    payment: VerifiedPayment;
  }>("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify({ sessionId }), // only the id — never a price
  });
}
