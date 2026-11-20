import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, XCircle } from "lucide-react";

// Title for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "Payment Cancelled | MentorLagbe",
  description: "Stripe checkout was cancelled — no money was taken.",
};

// ============================================================
// /payment/cancel — where Stripe sends the visitor when they
// back out of the hosted checkout page (cancel_url).
//
// Nothing was charged and nothing needs to be verified here,
// so the page is fully static: a friendly message + a way back
// to the pricing section on the home page.
// ============================================================
export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-emerald-950/5">
        {/* soft icon — this is NOT an error, just a decision */}
        <XCircle className="mx-auto h-14 w-14 text-slate-300" />

        {/* title */}
        <h1 className="mt-4 text-2xl font-bold text-[#173D32]">
          Payment cancelled
        </h1>

        {/* plain-language explanation */}
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
          You left the checkout page before paying, so{" "}
          <b>no money was taken</b> and your plan is still Free.
        </p>

        {/* reassurance about card details */}
        <p className="mx-auto mt-2 max-w-sm text-xs text-gray-400">
          Any card details you started typing were discarded by Stripe.
        </p>

        {/* action buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {/* go back to wherever they came from (usually pricing) */}
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
          {/* or start over from the home page */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
