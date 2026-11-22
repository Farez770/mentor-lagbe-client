import { apiFetch } from "./client";


export type CreateTuitionInput = {
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  location: string;
  fee: number;
  days: number;
  description: string;
  image: string;
};

export type PostedTuition = CreateTuitionInput & {
  id: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  postedBy: string;
  tutorName: string;
  tutorImage?: string;
  tutorPlan?: "free" | "pro";
  tutorVerified?: boolean;
  createdAt: string;
};

export function createTuition(input: CreateTuitionInput) {
  return apiFetch<{ message: string; tuition: PostedTuition }>(
    "/api/tuitions",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function getMyTuitions() {
  return apiFetch<{ tuitions: PostedTuition[] }>("/api/tuitions/mine");
}

export type TuitionFacets = {
  subjects: string[];
  classLevels: string[];
  modes: string[];
};

export type TuitionListResponse = {
  tuitions: PostedTuition[];
  total: number;
  totalAvailable: number;
  facets: TuitionFacets;
};

export type TuitionFilters = {
  q?: string;
  subject?: string;
  classLevel?: string;
  mode?: string;
};

export function getTuitions(filters: TuitionFilters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const clean = (value ?? "").trim();
    if (clean && clean.toLowerCase() !== "all") {
      params.set(key, clean);
    }
  });

  const query = params.toString();
  return apiFetch<TuitionListResponse>(
    query ? `/api/tuitions?${query}` : "/api/tuitions",
  );
}

export type TutorStats = {
  total: number; // every tuition this tutor posted
  approved: number; // approved + live listings
  pending: number; // waiting for admin approval
  applicants: number; // REAL application count (fixed 2026-11-21)
};

export function getTuitionStats() {
  return apiFetch<TutorStats>("/api/tuitions/stats");
}

export function getTuition(id: string) {
  return apiFetch<{ tuition: PostedTuition }>(`/api/tuitions/${id}`);
}

export function updateTuition(id: string, input: CreateTuitionInput) {
  return apiFetch<{ message: string; tuition: PostedTuition }>(
    `/api/tuitions/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function toggleTuition(id: string) {
  return apiFetch<{ message: string; tuition: PostedTuition }>(
    `/api/tuitions/${id}/toggle`,
    { method: "PATCH" },
  );
}

export function deleteTuition(id: string) {
  return apiFetch<{ message: string }>(`/api/tuitions/${id}`, {
    method: "DELETE",
  });
}
