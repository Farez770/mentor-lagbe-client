import { apiFetch } from "./client";


export type ApplicationInput = {
  tuitionId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  note: string;
};

export type Application = ApplicationInput & {
  id: string;
  tutorId: string;
  tuitionTitle: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export function applyForTuition(input: ApplicationInput) {
  return apiFetch<{ message: string; application: Application }>(
    "/api/applications",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function getTutorApplications() {
  return apiFetch<{ applications: Application[] }>(
    "/api/applications/tutor",
  );
}

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

export type StudentStats = {
  totalApplied: number; // Total Applied Tuitions
  accepted: number; // Accepted Applications
  pending: number; // Pending Applications
  plan: string; // Current Plan: "free" | "pro"
};

export function getStudentStats() {
  return apiFetch<{ stats: StudentStats }>("/api/applications/stats");
}

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

export function getMyApplications() {
  return apiFetch<{ applications: MyApplication[] }>(
    "/api/applications/mine",
  );
}

export function cancelApplication(id: string) {
  return apiFetch<{ message: string }>(`/api/applications/${id}`, {
    method: "DELETE",
  });
}
