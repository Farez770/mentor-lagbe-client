"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck, CreditCard, Loader2, TriangleAlert } from "lucide-react";
import { verifyPayment, type VerifiedPayment } from "@/lib/api/payments";
import { authClient } from "@/lib/auth-client";

type PayState = "verifying" | "done" | "error";

const planLabel: Record<string, string> = {
  tutor: "Pro Tutor Plan",
  student: "Pro Student Plan",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<PayState>(() =>
    sessionId ? "verifying" : "error",
  );
  const [message, setMessage] = useState(() =>
    sessionId ? "" : "Missing the checkout session id in the URL.",
  );
  const [payment, setPayment] = useState<VerifiedPayment | null>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!sessionId) return;

    let alive = true;

    verifyPayment(sessionId)
      .then((data) => {
        if (!alive) return;
        setPayment(data.payment);
        setState("done");
      })
      .catch((err) => {
        console.warn("Payment verification failed:", err);
        if (!alive) return;
        setMessage(
          err instanceof Error ? err.message : "Could not verify the payment",
        );
        setState("error");
      });

    return () => {
      alive = false;
    };
  }, [sessionId]);

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
        {state === "verifying" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
            <h1 className="mt-4 text-xl font-bold text-[#173D32]">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify the transaction with Stripe.
            </p>
          </>
        )}

        {state === "done" && (
          <>
            <CircleCheck className="mx-auto h-14 w-14 text-emerald-500" />
            <h1 className="mt-4 text-2xl font-bold text-[#173D32]">
              Payment successful!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              You paid{" "}
              <b>
                ${payment?.amount.toFixed(2)}{" "}
                {String(payment?.currency ?? "usd").toUpperCase()}
              </b>{" "}
              for the <b>{planLabel[payment?.product ?? ""] ?? "Pro"}</b>.
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              Your account is now Pro ✨
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-gray-500">
              {payment?.product === "tutor"
                ? "Unlimited tuition posts and the verified tutor badge are unlocked."
                : "Unlimited tuition bookmarks are unlocked — the Free plan stops at 5."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {session && (
                <Link
                  href={dashboardHref}
                  onClick={() => window.location.replace(dashboardHref)}
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Go to my Dashboard
                </Link>
              )}
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <TriangleAlert className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-4 text-xl font-bold text-[#173D32]">
              We couldn&apos;t confirm the payment
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
              {message}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs text-gray-400">
              If your card was charged, running the check again will record it
              safely — payments are never counted twice.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <CreditCard className="h-3.5 w-3.5" />
          Payments are processed securely by Stripe.
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
