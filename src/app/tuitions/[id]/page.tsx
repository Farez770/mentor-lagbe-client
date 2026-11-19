import type { Metadata } from "next";
import TuitionDetails from "@/components/tuitions/TuitionDetails";

// Title + description for this page (shown in the browser tab
// and used by search engines)
export const metadata: Metadata = {
  title: "Tuition Details | MentorLagbe",
  description: "Full details of a tuition listing on MentorLagbe.",
};

// This page needs the runtime `id` (params), so Next 16
// cacheComponents cannot freeze it into a static shell at build
// time — the build calls that a "blocking" route. `instant = false`
// tells the build to render this route on demand instead of
// prerendering it (it is a server component only — the export is
// not allowed inside client components).
export const instant = false;

// ============================================================
// The /tuitions/[id] page — one page per unique tuition id.
// Every "View Details" link (Browse page + home Featured
// section) points here, e.g. /tuitions/665f1c2e...abc
//
// Next 16: params is a Promise — we await it and pass the id
// to the client component, which loads the details from
// GET /api/tuitions/:id.
// ============================================================
export default async function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TuitionDetails id={id} />;
}
