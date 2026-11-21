import { apiFetch } from "./client";

// ============================================================
// Every function that calls the tuitions API of the Express
// server (the single ../mentor-lagbe-server/index.js file).
// Pages/components NEVER call fetch() directly — they import
// these functions instead.
// ============================================================

// The data the Post a Tuition form sends to the API
export type CreateTuitionInput = {
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  location: string;
  fee: number; // monthly fee
  days: number; // days per week (1-7)
  description: string;
  image: string; // banner URL (already uploaded to ImgBB)
};

// A tuition as it comes back from MongoDB
export type PostedTuition = CreateTuitionInput & {
  id: string; // MongoDB _id as a string
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  postedBy: string; // tutor's user id
  tutorName: string;
  tutorImage?: string;
  createdAt: string;
};

// POST /api/tuitions — save a new tuition (plan limit is
// checked on the server: free = 2, pro = unlimited)
export function createTuition(input: CreateTuitionInput) {
  return apiFetch<{ message: string; tuition: PostedTuition }>(
    "/api/tuitions",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

// GET /api/tuitions/mine — the logged-in tutor's own tuitions
// (used for the "X of 2 posts used" counter)
export function getMyTuitions() {
  return apiFetch<{ tuitions: PostedTuition[] }>("/api/tuitions/mine");
}

// GET /api/tuitions — the PUBLIC list (Browse Tuitions page),
// newest first. No login needed.
export function getTuitions() {
  return apiFetch<{ tuitions: PostedTuition[] }>("/api/tuitions");
}

// The four numbers shown on the tutor Overview dashboard
export type TutorStats = {
  total: number; // every tuition this tutor posted
  approved: number; // approved + live listings
  pending: number; // waiting for admin approval
  applicants: number; // REAL application count (fixed 2026-11-21)
};

// GET /api/tuitions/stats — real counts for the overview cards
export function getTuitionStats() {
  return apiFetch<TutorStats>("/api/tuitions/stats");
}

// GET /api/tuitions/:id — ONE tuition's full details
// (used by the /tuitions/[id] view details page)
export function getTuition(id: string) {
  return apiFetch<{ tuition: PostedTuition }>(`/api/tuitions/${id}`);
}

// PATCH /api/tuitions/:id — edit a tuition's details
// (approvalStatus is untouched: only the admin changes it)
export function updateTuition(id: string, input: CreateTuitionInput) {
  return apiFetch<{ message: string; tuition: PostedTuition }>(
    `/api/tuitions/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

// PATCH /api/tuitions/:id/toggle — switch Active <-> Closed
export function toggleTuition(id: string) {
  return apiFetch<{ message: string; tuition: PostedTuition }>(
    `/api/tuitions/${id}/toggle`,
    { method: "PATCH" },
  );
}

// DELETE /api/tuitions/:id — remove a tuition post
export function deleteTuition(id: string) {
  return apiFetch<{ message: string }>(`/api/tuitions/${id}`, {
    method: "DELETE",
  });
}
