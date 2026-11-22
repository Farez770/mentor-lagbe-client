"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { adminSections, demoAdmin } from "@/components/dashboard/adminData";
import {
  getAllTransactions,
  type AdminTransaction,
} from "@/lib/api/admin";


const roleStyles: Record<string, string> = {
  student: "bg-emerald-100 text-emerald-700",
  tutor: "bg-teal-100 text-teal-700",
  admin: "bg-purple-100 text-purple-700",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
  const [txs, setTxs] = useState<AdminTransaction[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;

    getAllTransactions()
      .then((data) => {
        if (!alive) return;
        setTxs(data.transactions);
        setLoadError(false);
      })
      .catch((err) => {
        console.warn("Could not load transactions:", err);
        if (!alive) return;
        setLoadError(true);
        setTxs([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const totalRevenue = (txs ?? []).reduce((sum, t) => sum + t.amount, 0);

  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Admin Dashboard"
        sections={adminSections}
        user={{ name: demoAdmin.name, role: "Admin", plan: demoAdmin.plan }}
      >
        <div className="mx-auto mt-12 max-w-6xl px-4">
          <div className="mb-5">
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              TRANSACTION MANAGEMENT
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Stripe Transactions
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Every verified Stripe payment on MentorLagbe — who paid, for which
              plan, how much and when.
            </p>
            {txs !== null && !loadError && (
              <span className="mt-2 flex flex-wrap gap-2">
                <p className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  {txs.length}{" "}
                  {txs.length === 1 ? "transaction" : "transactions"}
                </p>
                <p className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white ring-1 ring-emerald-600">
                  Total ${totalRevenue.toFixed(2)}
                </p>
              </span>
            )}
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <CreditCard className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load transactions
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                This page is for admin accounts only. Check that you&apos;re
                signed in as an admin and that the API server is running, then
                try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : txs === null ? (
            <LoadingSpinner label="Loading transactions…" />
          ) : txs.length === 0 ? (
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
            <div className="overflow-x-auto rounded-2xl bg-white shadow-lg ring-1 ring-emerald-950/5">
              <table className="w-full min-w-[900px] text-left text-sm">
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
                <tbody>
                  {txs.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-[#173D32]">
                        {t.userName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.userEmail}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            roleStyles[t.role] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {capitalize(t.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{t.planName}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        ${t.amount.toFixed(2)}{" "}
                        <span className="text-xs font-medium text-gray-400">
                          {String(t.currency).toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="max-w-[190px] truncate px-4 py-3 font-mono text-xs text-slate-500"
                        title={t.transactionId}
                      >
                        {t.transactionId || "—"}
                      </td>
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
