"use client";

// "use client" is needed because this page passes icon
// COMPONENTS (functions) to DashboardDrawer, and only client
// components may receive functions as props.
import { useEffect, useState } from "react"; // hooks: load the list, remember the busy row
import Link from "next/link"; // title links to the public tuition details page
import { toast } from "@heroui/react"; // success / error messages in the corner
import { Check, ClipboardCheck, X } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading"; // shared loading UI
import DashboardDrawer from "@/components/dashboard/DashboardDrawer"; // dashboard shell (sidebar + content area)
import { adminSections, demoAdmin } from "@/components/dashboard/adminData"; // shared admin sidebar
import {
  getAllTuitions, // GET /api/admin/tuitions
  setTuitionApproval, // PATCH /api/admin/tuitions/:id
  type AdminTuition, // the shape of one post
} from "@/lib/api/admin";

// ============================================================
// TUITION APPROVAL page (/dashboard/admin/tuitions)
//
// Project requirement:
//   Display all tuition posts submitted by tutors. Admin can
//   Approve (approvalStatus: 'approved') or Reject
//   (approvalStatus: 'rejected') any listing.
//
// Every post comes from GET /api/admin/tuitions — no demo data.
// ============================================================

// Status badge colors (same amber/emerald/rose family the
// student's applications page already uses)
const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", // waiting for a decision
  approved: "bg-emerald-100 text-emerald-700", // live for students
  rejected: "bg-rose-100 text-rose-700", // turned down
};

// "approved" -> "Approved" (badge text)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Friendly submission date, e.g. "19 Nov 2026"
const postedOn = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "unknown date";

export default function AdminTuitionApproval() {
  // null = still loading the list from the API
  const [tuitions, setTuitions] = useState<AdminTuition[] | null>(null);
  // true = the last request failed (API down or not an admin)
  const [loadError, setLoadError] = useState(false);
  // id of the post whose Approve/Reject request is running
  const [busyId, setBusyId] = useState<string | null>(null);

  // ---------- load every tuition post once when the page opens ----------
  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getAllTuitions() // GET /api/admin/tuitions
      .then((data) => {
        if (!alive) return; // page already left — do nothing
        setTuitions(data.tuitions); // store the real list
        setLoadError(false); // no error this time
      })
      .catch((err) => {
        console.warn("Could not load tuitions:", err); // log for debugging
        if (!alive) return; // page already left — do nothing
        setLoadError(true); // show the error card below
        setTuitions([]); // empty list so the UI stops spinning
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run exactly once

  // ------------------------------------------------------------
  // Approve or reject ONE post (called by the buttons below).
  // The decision is reversible: clicking the other button later
  // simply writes the opposite approvalStatus — that's why no
  // confirmation modal is needed here (unlike deleting).
  // ------------------------------------------------------------
  const onDecide = async (
    tuition: AdminTuition,
    newStatus: "approved" | "rejected",
  ) => {
    if (newStatus === tuition.approvalStatus) return; // already there

    setBusyId(tuition.id); // disable this card's buttons
    try {
      // PATCH /api/admin/tuitions/:id with { approvalStatus }
      const result = await setTuitionApproval(tuition.id, newStatus);
      // swap the status inside the list (server is truth)
      setTuitions((list) =>
        (list ?? []).map((t) =>
          t.id === tuition.id
            ? {
                ...t,
                approvalStatus: result.tuition
                  .approvalStatus as AdminTuition["approvalStatus"],
              }
            : t,
        ),
      );
      toast.success(result.message); // "Tuition approved" / "Tuition rejected"
    } catch (err) {
      // 403 (not admin), 404 (gone), network...
      toast.warning(
        err instanceof Error ? err.message : "Could not update the tuition",
      );
    } finally {
      setBusyId(null); // re-enable the buttons
    }
  };

  // How many posts are still waiting for a decision?
  const pendingCount =
    tuitions?.filter((t) => t.approvalStatus === "pending").length ?? 0;

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className="bg-slate-50 pb-6">
      {/* ====================================================
          DashboardDrawer = the dashboard SHELL (fixed sidebar
          + the only scrollable area). Navbar/Footer are hidden
          on /dashboard/* routes, so the shell fills the screen.
          ==================================================== */}
      <DashboardDrawer
        title="Admin Dashboard" // small subtitle under the logo
        sections={adminSections} // Overview · Users · Approval · Profile · Home
        // Fallback user while the session loads — the drawer
        // swaps in the REAL logged-in admin automatically.
        user={{ name: demoAdmin.name, role: "Admin", plan: demoAdmin.plan }}
      >
        <div className="mx-auto mt-16 max-w-5xl px-4">
          {/* ---------- Page heading ---------- */}
          <div className="mb-5">
            {/* tiny eyebrow label above the title */}
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              TUITION APPROVAL
            </p>
            {/* the page's main heading */}
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Review Tuitions
            </h1>
            {/* one-line explanation of what this page does */}
            <p className="mt-1.5 text-sm text-gray-600">
              Every tuition post submitted by tutors — approve it to make it
              live, or reject it.
            </p>
            {/* count pill (only once the list has loaded) */}
            {tuitions !== null && !loadError && (
              <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                {tuitions.length} {tuitions.length === 1 ? "post" : "posts"} ·{" "}
                {pendingCount} pending
              </p>
            )}
          </div>

          {/* ==================================================
              1) ERROR — API not reachable or not an admin
              ================================================== */}
          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              {/* icon for the empty-looking card */}
              <ClipboardCheck className="mx-auto h-9 w-9 text-slate-300" />
              {/* error title */}
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load tuitions
              </h2>
              {/* friendly explanation + how to fix it */}
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                This page is for admin accounts only. Check that you&apos;re
                signed in as an admin and that the API server is running, then
                try again.
              </p>
              {/* retry button — a full reload re-runs the fetch */}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : tuitions === null ? (
            /* ---------- 2) LOADING — request still running ---------- */
            <LoadingSpinner label="Loading tuitions…" />
          ) : tuitions.length === 0 ? (
            /* ---------- 3) EMPTY — no posts at all yet ---------- */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <ClipboardCheck className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                No tuition posts yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Nothing to review — posts appear here as soon as a tutor
                submits one.
              </p>
            </div>
          ) : (
            /* ---------- 4) THE LIST — one card per post ---------- */
            <ul className="space-y-4">
              {tuitions.map((tuition) => (
                <li
                  key={tuition.id} // stable React key = the post id
                  className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5"
                >
                  {/* top row: title/tutor on the left, status badge right */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      {/* post title — links to the public details page */}
                      <h2 className="font-bold text-[#173D32]">
                        <Link
                          href={`/tuitions/${tuition.id}`}
                          className="hover:underline"
                        >
                          {tuition.title}
                        </Link>
                      </h2>
                      {/* subject + class level */}
                      <p className="mt-0.5 text-sm text-gray-600">
                        {tuition.subject} · Class {tuition.classLevel}
                      </p>
                      {/* who submitted it and when */}
                      <p className="mt-0.5 text-xs text-gray-400">
                        by {tuition.tutorName} ({tuition.tutorEmail}) ·{" "}
                        {postedOn(tuition.createdAt)}
                        {/* small hint when the tutor paused the post */}
                        {!tuition.isActive && " · paused by tutor"}
                      </p>
                    </div>

                    {/* colored badge showing the CURRENT status */}
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[tuition.approvalStatus] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {capitalize(tuition.approvalStatus)}
                    </span>
                  </div>

                  {/* quick facts: mode, fee, days, location */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      {tuition.mode}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      ৳{tuition.fee}/month
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      {tuition.days} days/week
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      {tuition.location}
                    </span>
                  </div>

                  {/* description preview so the admin can read
                      what they are deciding on (2 lines max) */}
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {tuition.description}
                  </p>

                  {/* ============ DECISION BUTTONS ============
                      Approve writes approvalStatus: "approved",
                      Reject writes approvalStatus: "rejected".
                      The button matching the CURRENT status is
                      disabled (nothing to do), and both are
                      disabled while a request is running.
                      ====================================== */}
                  <div className="mt-4 flex items-center gap-2">
                    {/* ---- Approve ---- */}
                    <button
                      type="button"
                      onClick={() => onDecide(tuition, "approved")}
                      disabled={
                        busyId === tuition.id ||
                        tuition.approvalStatus === "approved"
                      }
                      title={
                        tuition.approvalStatus === "approved"
                          ? "This post is already approved"
                          : "Approve this post"
                      }
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {/* check icon + label */}
                      <Check className="h-4 w-4" />
                      Approve
                    </button>

                    {/* ---- Reject ---- */}
                    <button
                      type="button"
                      onClick={() => onDecide(tuition, "rejected")}
                      disabled={
                        busyId === tuition.id ||
                        tuition.approvalStatus === "rejected"
                      }
                      title={
                        tuition.approvalStatus === "rejected"
                          ? "This post is already rejected"
                          : "Reject this post"
                      }
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {/* x icon + label */}
                      <X className="h-4 w-4" />
                      Reject
                    </button>

                    {/* small "saving..." hint while the request runs */}
                    {busyId === tuition.id && (
                      <span className="text-xs text-slate-400">Saving…</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DashboardDrawer>
    </section>
  );
}
