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

// ============================================================
// One tuition post on the approval page
// ============================================================
export type AdminTuition = {
  id: string; // Mongo _id as a string (used in the PATCH url + links)
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  location: string;
  fee: number; // monthly fee (৳)
  days: number; // days per week
  description: string;
  image: string; // banner url ("" when none)
  approvalStatus: "pending" | "approved" | "rejected"; // ← what this page manages
  isActive: boolean; // false = tutor paused the post
  postedBy: string; // tutor's user id
  tutorName: string; // saved on the post when it was created
  tutorImage: string; // saved on the post when it was created
  tutorEmail: string; // joined from the users collection
  createdAt: string | null; // ISO date the tutor submitted it
};

// GET /api/admin/tuitions — every tuition post (admin role)
export function getAllTuitions() {
  return apiFetch<{ tuitions: AdminTuition[] }>("/api/admin/tuitions");
}

// PATCH /api/admin/tuitions/:id — approve or reject one post.
// The server blocks non-admins (403) and unknown posts (404).
export function setTuitionApproval(
  id: string,
  approvalStatus: "approved" | "rejected",
) {
  return apiFetch<{
    message: string;
    tuition: { id: string; approvalStatus: string };
  }>(`/api/admin/tuitions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ approvalStatus }), // the decision
  });
}
