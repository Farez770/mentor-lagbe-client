"use client";

// ============================================================
// /success — the OLD success page from the Stripe quickstart.
//
// The real page is now /payment/success (it verifies the session
// with our Express server, saves the payment row and upgrades the
// user to plan "pro"). This file just forwards old links to it,
// keeping the ?session_id=cs_... query string.
//
// (It's a client component so it can read window.location — that
// avoids the searchParams/Suspense rule and keeps the build happy.)
// ============================================================
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LegacySuccessRedirect() {
  useEffect(() => {
    // keep the session id so /payment/success can verify it
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    // build the new URL: /payment/success?session_id=...
    const target = sessionId
      ? `/payment/success?session_id=${encodeURIComponent(sessionId)}`
      : "/payment/success";
    // replace() (not href=) so the back button skips this stub
    window.location.replace(target);
  }, []); // runs once on mount

  // tiny spinner while the redirect happens
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
    </main>
  );
}
