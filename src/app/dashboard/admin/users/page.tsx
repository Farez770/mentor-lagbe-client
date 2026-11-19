import type { Metadata } from "next";
import AdminUsers from "@/components/dashboard/AdminUsers";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "User Management | MentorLagbe",
  description:
    "View every registered user and change their role (student, tutor, admin).",
};

// ============================================================
// /dashboard/admin/users — the admin's User Management page:
// a list of every registered account with a role dropdown
// (student / tutor / admin) that updates through the protected
// PATCH /api/admin/users/:id endpoint (admin role only).
// ============================================================
export default function AdminUsersPage() {
  return <AdminUsers />;
}
