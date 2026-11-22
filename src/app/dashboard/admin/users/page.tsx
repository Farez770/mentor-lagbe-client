import type { Metadata } from "next";
import AdminUsers from "@/components/dashboard/AdminUsers";

export const metadata: Metadata = {
  title: "User Management | MentorLagbe",
  description:
    "View every registered user and change their role (student, tutor, admin).",
};

export default function AdminUsersPage() {
  return <AdminUsers />;
}
