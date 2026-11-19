import { apiFetch } from "./client";

// ============================================================
// Every function that calls the tuitions API of the Express
// server (mentor-lagbe-server/src/routes/tuitions.ts).
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
