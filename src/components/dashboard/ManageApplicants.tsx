"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@heroui/react";
import {
  CalendarDays,
  Check,
  Mail,
  MessageSquare,
  Phone,
  Users,
  X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading"; // shared loader
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { demoTutor, tutorSections } from "@/components/dashboard/tutorData";
import {
  getTutorApplications,
  updateApplicationStatus,
  type Application,
} from "@/lib/api/applications";

// ============================================================
// MANAGE APPLICANTS page (/dashboard/tutor/applicants)
//
// Project requirement:
//   Display all students who applied to the tutor's tuition
//   posts (Student Name, Email, Phone, Preferred Schedule,
//   Note, Tuition Title) and let the tutor set each one to
//   "Accepted" or "Rejected".
//
// Everything comes from GET /api/applications/tutor — no demo
// data anywhere on this page.
// ============================================================

// Status badge colors (the tutor controls these three values)
const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

// "pending" -> "Pending"
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ManageApplicants() {
  // null = still loading the list
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  // id of the application whose Accept/Reject request is running
  const [busyId, setBusyId] = useState<string | null>(null);

  // ---------- load MY applicants once ----------
  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getTutorApplications()
      .then((data) => {
        if (!alive) return;
        setApplications(data.applications);
        setLoadError(false);
      })
      .catch((err) => {
        console.warn("Could not load applications:", err);
        if (!alive) return;
        setLoadError(true);
        setApplications([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  // ------------------------------------------------------------
  // Accept or reject one application
  // (PATCH /api/applications/:id)
  // ------------------------------------------------------------
  const onDecide = async (app: Application, status: "accepted" | "rejected") => {
    setBusyId(app.id); // disable this card's buttons
    try {
      const result = await updateApplicationStatus(app.id, status);
      // swap the updated application inside the list
      setApplications((list) =>
        (list ?? []).map((x) => (x.id === app.id ? result.application : x)),
      );
      toast.success(result.message);
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not update application",
      );
    } finally {
      setBusyId(null);
    }
  };

  // friendly date, e.g. "19 Nov 2026"
  const appliedOn = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Tutor Dashboard"
        sections={tutorSections}
        // Fallback user while the session loads — the drawer
        // swaps in the REAL logged-in user automatically.
        user={{ name: demoTutor.name, role: "Tutor", plan: demoTutor.plan }}
      >
        <div className="mx-auto mt-16 max-w-5xl px-4">
          {/* ---------- Page heading ---------- */}
          <div className="mb-5">
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              APPLICANTS
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Manage Applicants
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Every student who applied to your tuitions — check their contact
              details and preferred schedule, then accept or reject.
            </p>
            {applications !== null && !loadError && (
              <span className="mt-2 flex flex-wrap gap-2">
                <p className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  {applications.length}{" "}
                  {applications.length === 1 ? "application" : "applications"}
                </p>
                {/* ★ REQUIREMENT UPDATE (2026-11-21): the "⭐ Pro
                    students first" legend is DISABLED — the Pro
                    benefit changed from priority booking to
                    unlimited bookmarks (see lib/api/bookmarks.ts).
                    Uncomment together with the sort in GET
                    /api/applications/tutor if it ever returns.
                {applications.length > 0 && (
                  <p className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                    ⭐ Pro students&apos; applications appear first
                  </p>
                )}
                */}
              </span>
            )}
          </div>

          {/* ==================================================
              1) ERROR — API not reachable
              ================================================== */}
          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load your applicants
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Something went wrong while talking to the server. Check that
                the API server is running, then try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : applications === null ? (
            /* ---------- 2) LOADING (shared loader) ---------- */
            <LoadingSpinner label="Loading applicants…" />
          ) : applications.length === 0 ? (
            /* ---------- 3) EMPTY ---------- */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                No applications yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                When students apply to your tuition posts, they appear here
                with their contact details, preferred schedule and note.
              </p>
            </div>
          ) : (
            /* ---------- 4) THE LIST ---------- */
            <ul className="space-y-4">
              {applications.map((app) => (
                <li
                  key={app.id}
                  className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5"
                >
                  {/* student name + status badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* avatar: first letter (applications store no photo) */}
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {app.studentName.charAt(0)}
                      </span>
                      <div>
                        <h2 className="font-bold text-[#173D32]">
                          {app.studentName}
                          {/* ★ REQUIREMENT UPDATE (2026-11-21):
                              the "⭐ Priority" badge is DISABLED —
                              the Pro benefit changed from priority
                              booking to unlimited bookmarks (see
                              lib/api/bookmarks.ts), and the server
                              no longer returns studentPlan.
                              Uncomment together with the sort in
                              GET /api/applications/tutor if it
                              ever comes back.
                          {app.studentPlan === "pro" && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[11px] font-bold text-amber-700">
                              ⭐ Priority
                            </span>
                          )}
                          */}
                        </h2>
                        <p className="text-xs text-gray-500">
                          Applied on {appliedOn(app.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[app.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {capitalize(app.status)}
                    </span>
                  </div>

                  {/* which tuition (links to the details page) */}
                  <p className="mt-3 text-sm text-gray-600">
                    Applied for:{" "}
                    <Link
                      href={`/tuitions/${app.tuitionId}`}
                      className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
                    >
                      {app.tuitionTitle}
                    </Link>
                  </p>

                  {/* email · phone · preferred schedule */}
                  <div className="mt-2 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2">
                    <p className="flex items-center gap-2 break-all">
                      <Mail size={14} className="shrink-0 text-emerald-600" />
                      {app.studentEmail}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0 text-emerald-600" />
                      {app.studentPhone}
                    </p>
                    <p className="flex items-center gap-2 sm:col-span-2">
                      <CalendarDays
                        size={14}
                        className="shrink-0 text-emerald-600"
                      />
                      <span className="font-medium">
                        {app.preferredSchedule}
                      </span>
                    </p>
                  </div>

                  {/* the student's note (when they wrote one) */}
                  {app.note ? (
                    <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-gray-600 ring-1 ring-slate-100">
                      <MessageSquare
                        size={13}
                        className="mr-1.5 inline text-emerald-600"
                      />
                      {app.note}
                    </p>
                  ) : null}

                  {/* ---------- Accept / Reject ---------- */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === app.id || app.status === "accepted"}
                      onClick={() => onDecide(app, "accepted")}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={13} />
                      {app.status === "accepted" ? "Accepted" : "Accept"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === app.id || app.status === "rejected"}
                      onClick={() => onDecide(app, "rejected")}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-400 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={13} />
                      {app.status === "rejected" ? "Rejected" : "Reject"}
                    </button>
                    {busyId === app.id && (
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
