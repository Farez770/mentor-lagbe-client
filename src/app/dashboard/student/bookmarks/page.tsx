import type { Metadata } from "next";
import MyBookmarks from "@/components/dashboard/MyBookmarks";

export const metadata: Metadata = {
  title: "My Bookmarks | MentorLagbe",
  description:
    "Every tuition you bookmarked — free accounts can save up to 5, Pro accounts unlimited.",
};

export default function MyBookmarksPage() {
  return <MyBookmarks />;
}
