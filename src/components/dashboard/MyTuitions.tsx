"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, toast } from "@heroui/react";
import { FilePlus, Pencil, Power, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading"; // shared loading UI
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { demoTutor, tutorSections } from "@/components/dashboard/tutorData";
import {
  deleteTuition,
  getMyTuitions,
  toggleTuition,
  type PostedTuition,
} from "@/lib/api/tuitions";
import TuitionEditForm from "@/components/dashboard/TuitionEditForm";

// ============================================================
// MY TUITIONS page (/dashboard/tutor/my-tuitions)
//
// The project requirement — "My Created Tuitions (Full CRUD)":
//   - list every tuition the logged-in tutor created
//   - show the admin approvalStatus (pending/approved/rejected)
//   - show the active status (Active / Closed)
//   - Edit    -> inline form (PATCH /api/tuitions/:id)
//   - Toggle  -> Close / Reopen (PATCH /api/tuitions/:id/toggle)
//   - Delete  -> remove the post (DELETE /api/tuitions/:id)
//
// All data comes from the API — no demo data here.
// ============================================================

// Approval status colors (the admin controls this value)
const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

// "pending" -> "Pending" (first letter capital)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function MyTuitions() {
  // null = still loading the list
  const [tuitions, setTuitions] = useState<PostedTuition[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  // which card is currently open in edit mode (its id, or null)
  const [editingId, setEditingId] = useState<string | null>(null);
  // id of the card whose Toggle/Delete request is running
  const [busyId, setBusyId] = useState<string | null>(null);
  // the tuition waiting to be deleted — this state ALSO controls
  // the HeroUI confirm modal (null = modal closed)
  const [deleteTarget, setDeleteTarget] = useState<PostedTuition | null>(null);

  // ---------- load MY tuitions once ----------
  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getMyTuitions()
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

  // ------------------------------------------------------------
  // Toggle: Active <-> Closed
  // ------------------------------------------------------------
  const onToggle = async (t: PostedTuition) => {
    setBusyId(t.id); // disable this card's buttons
    try {
      const result = await toggleTuition(t.id);
      // replace the updated tuition inside the list
      setTuitions((list) =>
        (list ?? []).map((x) => (x.id === t.id ? result.tuition : x)),
      );
      toast.success(result.message);
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not change status",
      );
    } finally {
      setBusyId(null);
    }
  };

  // ------------------------------------------------------------
  // Delete (step 1): clicking the Delete button only OPENS the
  // HeroUI confirm modal — nothing is deleted at this point.
  // ------------------------------------------------------------
  const onDelete = (t: PostedTuition) => {
    setDeleteTarget(t);
  };

  // ------------------------------------------------------------
  // Delete (step 2): the user pressed "Delete" INSIDE the modal
  // -> close the modal, call the API, drop it from the list.
  // ------------------------------------------------------------
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const t = deleteTarget;
    setDeleteTarget(null); // close the modal right away

    setBusyId(t.id);
    try {
      const result = await deleteTuition(t.id);
      // drop the deleted tuition from the list
      setTuitions((list) => (list ?? []).filter((x) => x.id !== t.id));
      toast.success(result.message || "Tuition deleted");
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not delete tuition",
      );
    } finally {
      setBusyId(null);
    }
  };

  // ------------------------------------------------------------
  // Edit form saved -> swap the fresh data in, close the form
  // ------------------------------------------------------------
  const onSaved = (updated: PostedTuition) => {
    setTuitions((list) =>
      (list ?? []).map((x) => (x.id === updated.id ? updated : x)),
    );
    setEditingId(null);
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Tutor Dashboard"
        sections={tutorSections}
        // Fallback user shown for a moment while the session
        // loads — the drawer swaps in the REAL logged-in user.
        user={{ name: demoTutor.name, role: "Tutor", plan: demoTutor.plan }}
      >
        <div className="mx-auto mt-12 max-w-5xl px-4">
          {/* ---------- Page heading ---------- */}
          <div className="mb-5">
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              MY TUITIONS
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Your tuition listings
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Everything you&apos;ve posted lives here — check the admin&apos;s
              approval status, edit details, close or reopen a listing, or
              delete it.
            </p>
            {tuitions !== null && !loadError && (
              <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                {tuitions.length}{" "}
                {tuitions.length === 1 ? "tuition" : "tuitions"} posted
              </p>
            )}
          </div>

          {/* ==================================================
              1) ERROR — API not reachable
              ================================================== */}
          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Trash2 className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load your tuitions
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
          ) : tuitions === null ? (
            /* ---------- 2) LOADING (shared loader) ---------- */
            <LoadingSpinner label="Loading your tuitions…" />
          ) : tuitions.length === 0 ? (
            /* ---------- 3) EMPTY ---------- */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <FilePlus className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                You haven&apos;t posted any tuition yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Create your first listing and it will appear here with its
                approval status.
              </p>
              <Link
                href="/dashboard/tutor/post-tuition"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <FilePlus size={16} />
                Post your first tuition
              </Link>
            </div>
          ) : (
            /* ---------- 4) THE LIST ---------- */
            <ul className="space-y-4">
              {tuitions.map((t) => (
                <li key={t.id}>
                  {editingId === t.id ? (
                    /* this card is being edited -> show the form */
                    <TuitionEditForm
                      tuition={t}
                      onSaved={onSaved}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    /* normal card view */
                    <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5">
                      <div className="flex gap-4">
                        {/* thumbnail (plain img: host comes from the DB) */}
                        {/* eslint-disable-next-line @next/next/no-img-element -- DB image, host not known at build time */}
                        <img
                          src={t.image}
                          alt={t.title}
                          className="hidden h-24 w-36 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 sm:block"
                        />

                        <div className="min-w-0 flex-1">
                          {/* title + status badges */}
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="truncate font-bold text-[#173D32]">
                                {t.title}
                              </h2>
                              <p className="mt-0.5 text-sm text-gray-600">
                                {t.subject} · {t.classLevel}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              {/* admin approval status */}
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                  statusStyles[t.approvalStatus] ??
                                  "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {capitalize(t.approvalStatus)}
                              </span>
                              {/* active / closed status */}
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                  t.isActive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {t.isActive ? "Active" : "Closed"}
                              </span>
                            </div>
                          </div>

                          {/* quick facts */}
                          <p className="mt-1.5 text-sm text-gray-600">
                            ৳{t.fee.toLocaleString()}/month · {t.mode} ·{" "}
                            {t.days} {t.days === 1 ? "day" : "days"}/week
                            {t.mode === "Offline" ? ` · ${t.location}` : ""}
                          </p>

                          {/* description preview */}
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {t.description}
                          </p>

                          {/* ---------- actions ---------- */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingId(t.id)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>

                            {/* Toggle: Close / Reopen */}
                            <button
                              type="button"
                              disabled={busyId === t.id}
                              onClick={() => onToggle(t)}
                              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                t.isActive
                                  ? "border-amber-500 text-amber-700 hover:bg-amber-50"
                                  : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              <Power size={13} />
                              {busyId === t.id
                                ? "Working…"
                                : t.isActive
                                  ? "Close"
                                  : "Reopen"}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              disabled={busyId === t.id}
                              onClick={() => onDelete(t)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-400 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* ==================================================
              DELETE CONFIRM MODAL (HeroUI)
              Opens from the Delete button on any card. The post
              is only deleted after the user confirms here —
              Esc, a backdrop click or Cancel all abort.
              ================================================== */}
          <Modal
            isOpen={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <Modal.Backdrop>
              <Modal.Container placement="center">
                <Modal.Dialog>
                  <Modal.Header>
                    <Modal.Heading>Delete this tuition?</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p className="text-sm text-slate-600">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-slate-900">
                        &quot;{deleteTarget?.title}&quot;
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="flex w-full justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(null)}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDelete}
                        className="cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                      >
                        Delete
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
