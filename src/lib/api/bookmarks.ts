import { apiFetch } from "./client";


export type BookmarkTuition = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  fee: number;
  image: string;
  tutorName: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
};

export type Bookmark = {
  id: string;
  tuitionId: string;
  bookmarkedAt: string;
  tuition: BookmarkTuition | null;
};

export type BookmarkList = {
  bookmarks: Bookmark[];
  count: number;
  limit: number | null;
  plan: "free" | "pro";
};

export function getMyBookmarks() {
  return apiFetch<BookmarkList>("/api/bookmarks");
}

export function checkBookmark(tuitionId: string) {
  return apiFetch<{ bookmarked: boolean }>(
    `/api/bookmarks/check/${tuitionId}`,
  );
}

export function addBookmark(tuitionId: string) {
  return apiFetch<{ message: string }>("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify({ tuitionId }),
  });
}

export function removeBookmark(tuitionId: string) {
  return apiFetch<{ message: string }>(`/api/bookmarks/${tuitionId}`, {
    method: "DELETE",
  });
}
