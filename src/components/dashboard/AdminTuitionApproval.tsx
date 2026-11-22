"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@heroui/react";
import { Check, ClipboardCheck, X } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { adminSections, demoAdmin } from "@/components/dashboard/adminData";
import {
  getAllTuitions,
  setTuitionApproval,
  type AdminTuition,
} from "@/lib/api/admin";


const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const postedOn = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "unknown date";

export default function AdminTuitionApproval() {
  const [tuitions, setTuitions] = useState<AdminTuition[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    getAllTuitions()
      .then((data) => {
        if (!alive) return;
        setTuitions(data.tuitions);
        setLoadError(false);
      })
      .catch((err) => {
        console.warn("Could not load tuitions:", err);
        if (!alive) return;
        setLoadError(true);
        setTuitions([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const onDecide = async (
    tuition: AdminTuition,
    newStatus: "approved" | "rejected",
  ) => {
    if (newStatus === tuition.approvalStatus) return;

    setBusyId(tuition.id);
    try {
      const result = await setTuitionApproval(tuition.id, newStatus);
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
      toast.success(result.message);
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not update the tuition",
      );
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount =
    tuitions?.filter((t) => t.approvalStatus === "pending").length ?? 0;

  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Admin Dashboard"
        sections={adminSections}
        user={{ name: demoAdmin.name, role: "Admin", plan: demoAdmin.plan }}
      >
        <div className="mx-auto mt-12 max-w-5xl px-4">
          <div className="mb-5">
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              TUITION APPROVAL
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Review Tuitions
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Every tuition post submitted by tutors — approve it to make it
              live, or reject it.
            </p>
            {tuitions !== null && !loadError && (
              <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                {tuitions.length} {tuitions.length === 1 ? "post" : "posts"} ·{" "}
                {pendingCount} pending
              </p>
            )}
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <ClipboardCheck className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load tuitions
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                This page is for admin accounts only. Check that you&apos;re
                signed in as an admin and that the API server is running, then
                try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : tuitions === null ? (
            <LoadingSpinner label="Loading tuitions…" />
          ) : tuitions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <ClipboardCheck className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                No tuition posts yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Nothing to review — posts appear here as soon as a tutor submits
                one.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {tuitions.map((tuition) => (
                <li
                  key={tuition.id}
                  className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-bold text-[#173D32]">
                        <Link
                          href={`/tuitions/${tuition.id}`}
                          className="hover:underline"
                        >
                          {tuition.title}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {tuition.subject} · Class {tuition.classLevel}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        by {tuition.tutorName} ({tuition.tutorEmail}) ·{" "}
                        {postedOn(tuition.createdAt)}
                        {!tuition.isActive && " · paused by tutor"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[tuition.approvalStatus] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {capitalize(tuition.approvalStatus)}
                    </span>
                  </div>

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

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {tuition.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
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
                      <Check className="h-4 w-4" />
                      Approve
                    </button>

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
                      <X className="h-4 w-4" />
                      Reject
                    </button>

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
