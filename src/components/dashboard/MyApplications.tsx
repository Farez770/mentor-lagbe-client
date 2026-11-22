"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, toast } from "@heroui/react";
import { Ban, CalendarDays, Mail, Plus, Send, User } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import {
  demoStudent,
  studentSections,
} from "@/components/dashboard/studentData";
import {
  getMyApplications,
  cancelApplication,
  type MyApplication,
} from "@/lib/api/applications";


const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function MyApplications() {
  const [applications, setApplications] = useState<MyApplication[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<MyApplication | null>(null);


  useEffect(() => {
    let alive = true;

    getMyApplications()
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

  const onCancel = (app: MyApplication) => {
    setCancelTarget(app);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const app = cancelTarget;
    setCancelTarget(null);

    setBusyId(app.id);
    try {
      const result = await cancelApplication(app.id);
      setApplications((list) => (list ?? []).filter((x) => x.id !== app.id));
      toast.success(result.message || "Application cancelled");
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not cancel application",
      );
    } finally {
      setBusyId(null);
    }
  };

  const appliedOn = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Student Dashboard"
        sections={studentSections}
        user={{
          name: demoStudent.name,
          role: "Student",
          plan: demoStudent.plan,
        }}
      >
        <div className="mx-auto mt-12 max-w-5xl px-4">
          <div className="mb-5 flex justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-emerald-700">
                MY APPLICATIONS
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
                Tuitions you applied for
              </h1>
              <p className="mt-1.5 text-sm text-gray-600">
                Every tuition you&apos;ve applied to — check the tutor&apos;s
                decision and cancel anything still pending.
              </p>

              {applications !== null && !loadError && (
                <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  {applications.length}{" "}
                  {applications.length === 1 ? "application" : "applications"}
                </p>
              )}
            </div>
            <div className="flex justify-center items-center">
              <Link
                href="/tuitions"
                className="text-center px-5 py-3 rounded font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <span className="flex gap-2">
                  <Plus />
                  Add More Tuitions
                </span>
              </Link>
            </div>
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Send className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load your applications
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Something went wrong while talking to the server. Check that the
                API server is running, then try again.
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
            <LoadingSpinner label="Loading your applications…" />
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Send className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                You haven&apos;t applied yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Browse the tuition listings and apply to one — it will show up
                here with the tutor&apos;s decision.
              </p>
              <Link
                href="/tuitions"
                className="mt-5 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Browse Tuitions
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {applications.map((app) => (
                <li
                  key={app.id}
                  className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Send size={18} />
                      </span>
                      <div>
                        <h2 className="font-bold text-[#173D32]">
                          <Link
                            href={`/tuitions/${app.tuitionId}`}
                            className="underline-offset-2 hover:underline"
                          >
                            {app.tuitionTitle}
                          </Link>
                        </h2>
                        <p className="text-xs text-gray-500">
                          Applied on {appliedOn(app.appliedAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[app.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {capitalize(app.status)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2">
                    <p className="flex items-center gap-2 break-all">
                      <User size={14} className="shrink-0 text-emerald-600" />
                      {app.tutorName}
                    </p>
                    <p className="flex items-center gap-2 break-all">
                      <Mail size={14} className="shrink-0 text-emerald-600" />
                      {app.tutorEmail}
                    </p>
                    <p className="flex items-center gap-2 sm:col-span-2">
                      <CalendarDays
                        size={14}
                        className="shrink-0 text-emerald-600"
                      />
                      Monthly fee:{" "}
                      {app.fee === null ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className="font-semibold text-emerald-700">
                          ৳{app.fee.toLocaleString()}
                          <span className="font-normal text-gray-500">
                            {" "}
                            /month
                          </span>
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {app.status === "pending" ? (
                      <button
                        type="button"
                        disabled={busyId === app.id}
                        onClick={() => onCancel(app)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-400 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Ban size={13} />
                        Cancel Application
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Decided by the tutor — can no longer be cancelled
                      </span>
                    )}
                    {busyId === app.id && (
                      <span className="text-xs text-slate-400">
                        Cancelling…
                      </span>
                    )}
                    <Link
                      href={`/tuitions/${app.tuitionId}`}
                      className="ml-auto text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
                    >
                      View tuition →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Modal
            isOpen={cancelTarget !== null}
            onOpenChange={(open) => {
              if (!open) setCancelTarget(null);
            }}
          >
            <Modal.Backdrop>
              <Modal.Container placement="center">
                <Modal.Dialog>
                  <Modal.Header>
                    <Modal.Heading>Cancel this application?</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p className="text-sm text-slate-600">
                      Are you sure you want to cancel your application for{" "}
                      <span className="font-semibold text-slate-900">
                        &quot;{cancelTarget?.tuitionTitle}&quot;
                      </span>
                      ? The tutor will no longer see it.
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="flex w-full justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCancelTarget(null)}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Keep Application
                      </button>
                      <button
                        type="button"
                        onClick={confirmCancel}
                        className="cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                      >
                        Cancel Application
                      </button>
                    </div>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </div>
      </DashboardDrawer>
    </section>
  );
}
