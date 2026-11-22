import { apiFetch } from "./client";

export type AdminStats = {
  totalUsers: number;
  totalTutors: number;
  pendingTuitions: number;
  approvedTuitions: number;
  totalRevenue: number;
};

export function getAdminStats() {
  return apiFetch<{ stats: AdminStats }>("/api/admin/stats");
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "student" | "tutor" | "admin";
  plan: string;
  createdAt: string | null;
};

export function getAllUsers() {
  return apiFetch<{ users: AdminUser[] }>("/api/admin/users");
}

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

export function getAllTuitions() {
  return apiFetch<{ tuitions: AdminTuition[] }>("/api/admin/tuitions");
}

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

export type AdminTransaction = {
  id: string; // Mongo _id as a string (React row key)
  userName: string; // joined from users ("(deleted user)" if gone)
  userEmail: string; // joined from users (payment's own copy as fallback)
  role: string; // "student" | "tutor" | "admin" | "unknown"
  planName: string; // "Pro Tutor Plan" | "Pro Student Plan"
  amount: number; // whole dollars: 15 or 10
  currency: string; // "usd"
  transactionId: string; // Stripe payment intent id (pi_...)
  paymentDate: string | null; // ISO date the payment was made
  status: string; // "paid"
};

export function getAllTransactions() {
  return apiFetch<{ transactions: AdminTransaction[] }>(
    "/api/admin/transactions",
  );
}
