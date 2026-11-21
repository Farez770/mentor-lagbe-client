import { apiFetch } from "./client";

// ============================================================
// BOOKMARKS — NEW requirement (2026-11-21):
//   "Free Students can bookmark 5 tuitions;
//    Pro Students can bookmark unlimited tuitions."
//
// A bookmark is just "save this tuition for later". Every
// function calls the Express API (../mentor-lagbe-server).
// Pages/components NEVER call fetch() directly.
// ============================================================

// One tuition as embedded inside a bookmark row (null when
// the tuition itself was deleted after being bookmarked)
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

// One row of the "My Bookmarks" list
export type Bookmark = {
  id: string;
  tuitionId: string; // used for the View Details link
  bookmarkedAt: string; // ISO date string
  tuition: BookmarkTuition | null; // null = tuition was deleted
};

// What GET /api/bookmarks answers with (the list + the plan
// info the page needs for its "X of 5" / "Unlimited" pill)
export type BookmarkList = {
  bookmarks: Bookmark[];
  count: number; // how many I have bookmarked
  limit: number | null; // 5 for free plan, null = unlimited (pro)
  plan: "free" | "pro";
};

// GET /api/bookmarks — my bookmarked tuitions (student only)
export function getMyBookmarks() {
  return apiFetch<BookmarkList>("/api/bookmarks");
}

// GET /api/bookmarks/check/:tuitionId — is this one bookmarked?
// (the View Details page picks "Bookmark" / "Bookmarked ✓")
export function checkBookmark(tuitionId: string) {
  return apiFetch<{ bookmarked: boolean }>(
    `/api/bookmarks/check/${tuitionId}`,
  );
}

// POST /api/bookmarks — save a tuition.
// The SERVER enforces the plan limit: free students get a
// 403 with the message "Free plan allows up to 5 bookmarks..."
// which the caller shows in a toast.
export function addBookmark(tuitionId: string) {
  return apiFetch<{ message: string }>("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify({ tuitionId }),
  });
}

// DELETE /api/bookmarks/:tuitionId — remove a bookmark
export function removeBookmark(tuitionId: string) {
  return apiFetch<{ message: string }>(`/api/bookmarks/${tuitionId}`, {
    method: "DELETE",
  });
}
