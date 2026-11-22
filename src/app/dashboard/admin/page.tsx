import type { Metadata } from "next";
import AdminOverview from "@/components/dashboard/AdminOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard | MentorLagbe",
  description:
    "Platform statistics: total users, tutors, tuitions awaiting approval and Stripe revenue.",
};

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
