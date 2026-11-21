import type { Metadata } from "next";
import MyBookmarks from "@/components/dashboard/MyBookmarks";

// Title + description for this page (browser tab / search engines)
export const metadata: Metadata = {
  title: "My Bookmarks | MentorLagbe",
  description:
    "Every tuition you bookmarked — free accounts can save up to 5, Pro accounts unlimited.",
};

// ============================================================
// /dashboard/student/bookmarks — "My Bookmarks": the list of
// tuitions the student saved, with a remove button (confirm
// modal) and the plan slot counter ("3 of 5 used").
// ============================================================
export default function MyBookmarksPage() {
  return <MyBookmarks />;
}
