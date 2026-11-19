import { apiFetch } from "./client";

// ============================================================
// Profile — the 4 fields the Update Profile page can change
// (Name, Phone, Bio, Profile Picture). Every role may edit
// them; see PATCH /api/profile in the Express server.
// ============================================================

// What the form sends to the server
export type ProfileForm = {
  name: string;
  phone: string;
  bio: string;
  image: string; // "" = no photo
};

// What PATCH /api/profile answers with
export type ProfileResult = {
  message: string;
  profile: ProfileForm & {
    email: string; // read-only here (never changes)
    role: string; // read-only info
    plan: string; // read-only info
  };
};

// PATCH /api/profile — update MY profile. The login token is
// attached inside apiFetch, so the server knows who is calling.
export function updateProfile(input: ProfileForm) {
  return apiFetch<ProfileResult>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
