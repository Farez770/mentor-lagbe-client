import type { Metadata } from "next";
import AdminTransactions from "@/components/dashboard/AdminTransactions";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "Transaction Management | MentorLagbe",
  description:
    "View every Stripe payment record: buyer, plan, amount, transaction id and date.",
};

// ============================================================
// /dashboard/admin/transactions — the admin's Transaction
// Management page: every Stripe payment row from the "payments"
// collection (User Name, Email, Role, Plan Name, Amount,
// Transaction ID, Payment Date), read through the protected
// GET /api/admin/transactions endpoint (admin role only).
// ============================================================
export default function AdminTransactionsPage() {
  return <AdminTransactions />;
}
