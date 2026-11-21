"use client";

// "use client" is needed because this page passes icon
// COMPONENTS (functions) to DashboardDrawer, and only client
// components may receive functions as props.
import { useEffect, useState } from "react"; // hooks: load the list once
import { CreditCard } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading"; // shared loading UI
import DashboardDrawer from "@/components/dashboard/DashboardDrawer"; // dashboard shell (sidebar + content area)
import { adminSections, demoAdmin } from "@/components/dashboard/adminData"; // shared admin sidebar
import {
  getAllTransactions, // GET /api/admin/transactions
  type AdminTransaction, // the shape of one row
} from "@/lib/api/admin";

// ============================================================
// TRANSACTION MANAGEMENT page (/dashboard/admin/transactions)
//
// Project requirement:
//   "Display all Stripe subscription payment records from the
//   payments collection (User Name, Email, Role, Plan Name,
//   Amount, Transaction ID, Payment Date)."
//
// Every row comes from GET /api/admin/transactions (Express,
// admin role only) — no demo data. This page is READ-ONLY:
// money records can be viewed, never edited.
// ============================================================

// Role badge colors — same families as the User Management page
const roleStyles: Record<string, string> = {
  student: "bg-emerald-100 text-emerald-700", // green for students
  tutor: "bg-teal-100 text-teal-700", // teal for tutors
  admin: "bg-purple-100 text-purple-700", // purple for admins
};

// "student" -> "Student" (badge text)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "2026-11-19T17:43:13.188Z" -> "19 Nov 2026, 17:43"
const paidOn = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "unknown";

export default function AdminTransactions() {
  // null = still loading the list from the API
  const [txs, setTxs] = useState<AdminTransaction[] | null>(null);
  // true = the last request failed (API down or not an admin)
  const [loadError, setLoadError] = useState(false);

  // ---------- load every payment once when the page opens ----------
  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getAllTransactions() // GET /api/admin/transactions
      .then((data) => {
        if (!alive) return; // page already left — do nothing
        setTxs(data.transactions); // store the real list
        setLoadError(false); // no error this time
      })
      .catch((err) => {
        console.warn("Could not load transactions:", err);
        if (!alive) return; // page already left — do nothing
        setLoadError(true); // show the error card below
        setTxs([]); // empty list so the UI stops spinning
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run exactly once

  // Total money collected — the same sum the Overview's
  // "Stripe Revenue" card shows (amounts are whole dollars).
  const totalRevenue = (txs ?? []).reduce((sum, t) => sum + t.amount, 0);

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className="bg-slate-50 pb-6">
      {/* ====================================================
          DashboardDrawer = the dashboard SHELL (fixed sidebar
          + the only scrollable area). Navbar/Footer are hidden
          on /dashboard/* routes, so the shell fills the screen.
          ==================================================== */}
      <DashboardDrawer
        title="Admin Dashboard" // small subtitle under the logo
        sections={adminSections} // Overview · Users · Tuitions · Transactions · ...
        // Fallback user while the session loads — the drawer
        // swaps in the REAL logged-in admin automatically.
        user={{ name: demoAdmin.name, role: "Admin", plan: demoAdmin.plan }}
      >
        <div className="mx-auto mt-16 max-w-6xl px-4">
          {/* ---------- Page heading ---------- */}
          <div className="mb-5">
            {/* tiny eyebrow label above the title */}
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              TRANSACTION MANAGEMENT
            </p>
            {/* the page's main heading */}
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Stripe Transactions
            </h1>
            {/* one-line explanation of what this page shows */}
            <p className="mt-1.5 text-sm text-gray-600">
              Every verified Stripe payment on MentorLagbe — who paid, for
              which plan, how much and when.
            </p>
            {/* pills: row count + total revenue (once loaded) */}
            {txs !== null && !loadError && (
              <span className="mt-2 flex flex-wrap gap-2">
                <p className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  {txs.length} {txs.length === 1 ? "transaction" : "transactions"}
                </p>
                <p className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white ring-1 ring-emerald-600">
                  Total ${totalRevenue.toFixed(2)}
                </p>
              </span>
            )}
          </div>

          {/* ==================================================
              1) ERROR — API not reachable or not an admin
              ================================================== */}
          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              {/* icon for the error card */}
              <CreditCard className="mx-auto h-9 w-9 text-slate-300" />
              {/* error title */}
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load transactions
              </h2>
              {/* friendly explanation + how to fix it */}
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                This page is for admin accounts only. Check that you&apos;re
                signed in as an admin and that the API server is running, then
                try again.
              </p>
              {/* retry button — a full reload re-runs the fetch */}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : txs === null ? (
            /* ---------- 2) LOADING — request still running ---------- */
            <LoadingSpinner label="Loading transactions…" />
          ) : txs.length === 0 ? (
            /* ---------- 3) EMPTY — nobody has paid yet ---------- */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <CreditCard className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                No transactions yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Payments appear here the moment someone completes a Stripe
                checkout for the Pro plan.
              </p>
            </div>
          ) : (
            /* ---------- 4) THE TABLE ----------
                Wrapped in overflow-x-auto: on small screens the
                table scrolls sideways instead of breaking layout. */
            <div className="overflow-x-auto rounded-2xl bg-white shadow-lg ring-1 ring-emerald-950/5">
              <table className="w-full min-w-[900px] text-left text-sm">
                {/* ---- column headers (the 7 required fields) ---- */}
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">User Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Plan Name</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Payment Date</th>
                  </tr>
                </thead>
                {/* ---- one row per verified payment ---- */}
                <tbody>
                  {txs.map((t) => (
                    <tr
                      key={t.id} // stable React key = the payment id
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                    >
                      {/* user name (falls back for deleted accounts) */}
                      <td className="px-4 py-3 font-semibold text-[#173D32]">
                        {t.userName}
                      </td>
                      {/* email */}
                      <td className="px-4 py-3 text-gray-600">
                        {t.userEmail}
                      </td>
                      {/* role badge (same colors as User Management) */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            roleStyles[t.role] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {capitalize(t.role)}
                        </span>
                      </td>
                      {/* what was bought */}
                      <td className="px-4 py-3 text-gray-700">
                        {t.planName}
                      </td>
                      {/* amount — $10.00 / $15.00 (green = money IN) */}
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        ${t.amount.toFixed(2)}{" "}
                        <span className="text-xs font-medium text-gray-400">
                          {String(t.currency).toUpperCase()}
                        </span>
                      </td>
                      {/* Stripe payment id (pi_...) — full value on hover */}
                      <td
                        className="max-w-[190px] truncate px-4 py-3 font-mono text-xs text-slate-500"
                        title={t.transactionId}
                      >
                        {t.transactionId || "—"}
                      </td>
                      {/* payment date + time */}
                      <td className="px-4 py-3 text-gray-600">
                        {paidOn(t.paymentDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardDrawer>
    </section>
  );
}
