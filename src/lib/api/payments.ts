import { apiFetch } from "./client";


export type CheckoutPlan = "tutor" | "student";

export type VerifiedPayment = {
  product: "tutor" | "student";
  amount: number;
  currency: string;
};

export async function startCheckout(plan: CheckoutPlan, email?: string) {
  const res = await fetch("/api/checkout_sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(email ? { plan, email } : { plan }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (body as { message?: string } | null)?.message ??
        `Checkout failed (${res.status})`,
    );
  }
  return body as { url: string };
}

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
