"use client";

// ============================================================
// /payment/success — where Stripe sends the visitor AFTER a
// completed payment (success_url in the checkout session).
//
// Stripe appends ?session_id=cs_... to the URL. This page:
//   1. shows a "verifying" spinner
//   2. calls POST /api/payments/verify (Express) — the server
//      re-checks the session with Stripe, saves the row in the
//      "payments" collection and sets plan: "pro" on the user
//   3. shows a success card (or a friendly error card)
// ============================================================
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck, CreditCard, Loader2, TriangleAlert } from "lucide-react";
import { verifyPayment, type VerifiedPayment } from "@/lib/api/payments";
import { authClient } from "@/lib/auth-client";

// Three possible states of this page
type PayState = "verifying" | "done" | "error";

// Friendly name for each product (matches the checkout catalog)
const planLabel: Record<string, string> = {
  tutor: "Pro Tutor Plan",
  student: "Pro Student Plan",
};

// The actual code that reads ?session_id= (must live below the
// <Suspense> boundary — see the default export at the bottom)
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id"); // cs_test_...

  // "verifying" -> "done" | "error"
  // (if the URL has no session id we start in the error state —
  // doing this in the useState initializer instead of inside the
  // effect avoids a synchronous setState during render, which the
  // React Compiler lint rule forbids)
  const [state, setState] = useState<PayState>(() =>
    sessionId ? "verifying" : "error",
  );
  // error message for the error card
  const [message, setMessage] = useState(() =>
    sessionId ? "" : "Missing the checkout session id in the URL.",
  );
  // what to display on the success card (amount, plan)
  const [payment, setPayment] = useState<VerifiedPayment | null>(null);

  // The logged-in buyer — only used to build the right
  // dashboard link (tutor -> /dashboard/tutor, ...)
  const { data: session } = authClient.useSession();

  // ---------- verify the payment exactly once ----------
  useEffect(() => {
    // No session id in the URL? The state was already initialised
    // to the error card above — nothing to verify.
    if (!sessionId) return;

    // "alive" = ignore the answer if the page was left first
    let alive = true;

    verifyPayment(sessionId) // POST /api/payments/verify
      .then((data) => {
        if (!alive) return; // page already left — do nothing
        setPayment(data.payment); // amount + plan for the card
        setState("done"); // show the success card
      })
      .catch((err) => {
        console.warn("Payment verification failed:", err);
        if (!alive) return; // page already left — do nothing
        setMessage(
          err instanceof Error ? err.message : "Could not verify the payment",
        );
        setState("error"); // show the error card
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, [sessionId]); // runs once per session id

  // Where the "Go to Dashboard" button should go (same
  // 3-way rule as the sign-in page; default = student while
  // the session is still loading)
  const role = String(session?.user?.role ?? "");
  const dashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/student";

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-emerald-950/5">
        {/* ==================================================
            1) VERIFYING — Stripe redirected, server is checking
            ================================================== */}
        {state === "verifying" && (
          <>
            {/* spinning loader */}
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
            {/* what is happening, in plain words */}
            <h1 className="mt-4 text-xl font-bold text-[#173D32]">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify the transaction with Stripe.
            </p>
          </>
        )}

        {/* ==================================================
            2) DONE — payment verified, plan upgraded
            ================================================== */}
        {state === "done" && (
          <>
            {/* big green check */}
            <CircleCheck className="mx-auto h-14 w-14 text-emerald-500" />
            {/* happy title */}
            <h1 className="mt-4 text-2xl font-bold text-[#173D32]">
              Payment successful!
            </h1>
            {/* the exact amount + plan they bought */}
            <p className="mt-2 text-sm text-gray-600">
              You paid{" "}
              <b>
                ${payment?.amount.toFixed(2)}{" "}
                {String(payment?.currency ?? "usd").toUpperCase()}
              </b>{" "}
              for the{" "}
              <b>{planLabel[payment?.product ?? ""] ?? "Pro"}</b>.
            </p>
            {/* the upgrade itself */}
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              Your account is now Pro ✨
            </p>
            {/* plan-specific perks */}
            <p className="mx-auto mt-3 max-w-sm text-sm text-gray-500">
              {payment?.product === "tutor"
                ? "Unlimited tuition posts and the verified tutor badge are unlocked."
                : "Unlimited tuition bookmarks are unlocked — the Free plan stops at 5."}
            </p>

            {/* action buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {/* dashboard (only once we know who is logged in) */}
              {session && (
                <Link
                  href={dashboardHref}
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Go to my Dashboard
                </Link>
              )}
              {/* back to the home page */}
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        {/* ==================================================
            3) ERROR — verification failed (not paid / network)
            ================================================== */}
        {state === "error" && (
          <>
            {/* warning triangle */}
            <TriangleAlert className="mx-auto h-12 w-12 text-amber-500" />
            {/* title */}
            <h1 className="mt-4 text-xl font-bold text-[#173D32]">
              We couldn&apos;t confirm the payment
            </h1>
            {/* server's message (e.g. "not completed yet") */}
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
              {message}
            </p>
            {/* reassurance — Stripe only charges on completed checkouts */}
            <p className="mx-auto mt-2 max-w-sm text-xs text-gray-400">
              If your card was charged, running the check again will record it
              safely — payments are never counted twice.
            </p>

            {/* action buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {/* retry = re-run the verify effect (fresh page load) */}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
              {/* leave without paying anything */}
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        {/* tiny Stripe hint under the card */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <CreditCard className="h-3.5 w-3.5" />
          Payments are processed securely by Stripe.
        </p>
      </div>
    </main>
  );
}

// ============================================================
// Page export — useSearchParams() needs a Suspense boundary
// (Next.js requirement, otherwise the build complains).
// ============================================================
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        // shown for a split second while the URL is parsed
        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
