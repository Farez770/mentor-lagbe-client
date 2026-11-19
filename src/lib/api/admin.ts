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

// ============================================================
// One row of the User Management list
// ============================================================
export type AdminUser = {
  id: string; // Mongo _id as a string (used in the PATCH url)
  name: string;
  email: string;
  image: string; // "" when the user has no photo
  role: "student" | "tutor" | "admin"; // the three manageable roles
  plan: string; // "free" | "pro"
  createdAt: string | null; // ISO date of signing up
};

// GET /api/admin/users — every registered user (admin role)
export function getAllUsers() {
  return apiFetch<{ users: AdminUser[] }>("/api/admin/users");
}

// PATCH /api/admin/users/:id — change one user's role.
// The server blocks non-admins (403) and self-changes (400).
export function updateUserRole(
  id: string,
  role: "student" | "tutor" | "admin",
) {
  return apiFetch<{ message: string; user: AdminUser }>(
    `/api/admin/users/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }), // only the role is sent
    },
  );
}
