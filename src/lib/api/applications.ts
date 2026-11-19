import { apiFetch } from "./client";

// ============================================================
// Applications — a student applies for a tuition, the tutor
// reviews it in the Manage Applicants page.
//
// Every function calls the Express API
// (../mentor-lagbe-server/index.js). Pages/components NEVER
// call fetch() directly — they import these functions instead.
// ============================================================

// What the "Apply" form sends to POST /api/applications
export type ApplicationInput = {
  tuitionId: string; // which tuition this is for
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string; // e.g. "Sat–Wed, 7:00 PM"
  note: string; // optional ("" when left empty)
};

// One application as it comes back from MongoDB
export type Application = ApplicationInput & {
  id: string;
  tutorId: string; // the tutor who reviews it
  tuitionTitle: string; // snapshot shown in the tutor's inbox
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

// POST /api/applications — send an application (login required;
// one application per student per tuition)
export function applyForTuition(input: ApplicationInput) {
  return apiFetch<{ message: string; application: Application }>(
    "/api/applications",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

// GET /api/applications/tutor — ALL applications that arrived
// on MY tuition posts (tutor role required, newest first)
export function getTutorApplications() {
  return apiFetch<{ applications: Application[] }>(
    "/api/applications/tutor",
  );
}

// PATCH /api/applications/:id — accept or reject one application
export function updateApplicationStatus(
  id: string,
  status: "accepted" | "rejected",
) {
  return apiFetch<{ message: string; application: Application }>(
    `/api/applications/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

// ============================================================
// Student Overview numbers (the 4 dashboard stat cards)
// ============================================================
export type StudentStats = {
  totalApplied: number; // Total Applied Tuitions
  accepted: number; // Accepted Applications
  pending: number; // Pending Applications
  plan: string; // Current Plan: "free" | "pro"
};

// GET /api/applications/stats — MY application counts
// (login required, student role)
export function getStudentStats() {
  return apiFetch<{ stats: StudentStats }>("/api/applications/stats");
}

// ============================================================
// One row of the "My Applications" list
// ============================================================
export type MyApplication = {
  id: string;
  tuitionId: string; // used for the link to the details page
  tuitionTitle: string;
  tutorName: string;
  tutorEmail: string;
  fee: number | null; // null when the tuition was deleted
  appliedAt: string; // ISO date string, e.g. "2026-11-19T..."
  status: "pending" | "accepted" | "rejected";
};

// GET /api/applications/mine — every application I sent
// (login required, student role). The backend joins the
// tutor name/email and the fee for each row.
export function getMyApplications() {
  return apiFetch<{ applications: MyApplication[] }>(
    "/api/applications/mine",
  );
}

// DELETE /api/applications/:id — cancel MY OWN application.
// The server only allows this while the status is "pending".
export function cancelApplication(id: string) {
  return apiFetch<{ message: string }>(`/api/applications/${id}`, {
    method: "DELETE",
  });
}
