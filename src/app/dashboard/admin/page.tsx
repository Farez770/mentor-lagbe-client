import type { Metadata } from "next";
import AdminOverview from "@/components/dashboard/AdminOverview";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "Admin Dashboard | MentorLagbe",
  description:
    "Platform statistics: total users, tutors, tuitions awaiting approval and Stripe revenue.",
};

// ============================================================
// /dashboard/admin — the admin's Overview page: 4 reusable
// stats cards (Total Users, Total Tutors, Pending vs. Approved
// Tuitions, Total Stripe Revenue).
//
// Only accounts whose DB role is "admin" get real numbers —
// the API answers 403 for everyone else and the page shows an
// error card instead of fake data.
// ============================================================
export default function AdminDashboardPage() {
  return <AdminOverview />;
}
