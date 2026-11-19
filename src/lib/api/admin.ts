import { apiFetch } from "./client";

// ============================================================
// Numbers behind the 4 admin Overview cards
// ============================================================
export type AdminStats = {
  totalUsers: number; // Total Users
  totalTutors: number; // Total Tutors
  pendingTuitions: number; // ┐ Pending vs. Approved
  approvedTuitions: number; // ┘ Tuitions
  totalRevenue: number; // Total Stripe Revenue (৳)
};

// GET /api/admin/stats — platform statistics
// (login required, admin role — everyone else gets a 403)
export function getAdminStats() {
  return apiFetch<{ stats: AdminStats }>("/api/admin/stats");
}
