import { apiFetch } from "./client";


export type ProfileForm = {
  name: string;
  phone: string;
  bio: string;
  image: string;
};

export type ProfileResult = {
  message: string;
  profile: ProfileForm & {
    email: string;
    role: string;
    plan: string;
  };
};

export function updateProfile(input: ProfileForm) {
  return apiFetch<ProfileResult>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
