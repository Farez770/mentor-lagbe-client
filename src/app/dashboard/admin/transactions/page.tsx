import type { Metadata } from "next";
import AdminTransactions from "@/components/dashboard/AdminTransactions";

export const metadata: Metadata = {
  title: "Transaction Management | MentorLagbe",
  description:
    "View every Stripe payment record: buyer, plan, amount, transaction id and date.",
};

export default function AdminTransactionsPage() {
  return <AdminTransactions />;
}
