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
