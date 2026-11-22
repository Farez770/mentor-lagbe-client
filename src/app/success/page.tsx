"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LegacySuccessRedirect() {
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    const target = sessionId
      ? `/payment/success?session_id=${encodeURIComponent(sessionId)}`
      : "/payment/success";
    window.location.replace(target);
  }, []); // runs once on mount

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
    </main>
  );
}
