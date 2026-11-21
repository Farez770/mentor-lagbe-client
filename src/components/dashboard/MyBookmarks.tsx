"use client";

// "use client" is needed because this page passes icon
// COMPONENTS (functions) to DashboardDrawer, and only client
// components may receive functions as props.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, toast } from "@heroui/react";
import {
  Bookmark,
  BookmarkX,
  CalendarDays,
  GraduationCap,
  User,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading"; // shared loader
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import {
  demoStudent,
  studentSections,
} from "@/components/dashboard/studentData";
import {
  getMyBookmarks,
  removeBookmark,
  type Bookmark as BookmarkRow,
} from "@/lib/api/bookmarks";

// ============================================================
// MY BOOKMARKS page (/dashboard/student/bookmarks)
//
// NEW requirement (2026-11-21):
//   "Free Students can bookmark 5 tuitions;
//    Pro Students can bookmark unlimited tuitions."
//
// This page shows every tuition the student saved, how many
// of their free slots are used ("3 of 5"), and lets them
// REMOVE a bookmark through a HeroUI confirm modal (project
// rule: no window.confirm anywhere).
//
// Everything comes from GET /api/bookmarks — no demo data.
// ============================================================

export default function MyBookmarks() {
  // null = still loading the list
  const [bookmarks, setBookmarks] = useState<BookmarkRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  // plan info from the API: limit = 5 (free) or null (pro)
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);
  const [plan, setPlan] = useState<"free" | "pro">("free");

  // tuitionId whose Remove request is running
  const [busyId, setBusyId] = useState<string | null>(null);
  // which bookmark the confirm modal is open for (null = closed)
  const [removeTarget, setRemoveTarget] = useState<BookmarkRow | null>(null);

  // ---------- load MY bookmarks once ----------
  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getMyBookmarks()
      .then((data) => {
        if (!alive) return;
        setBookmarks(data.bookmarks);
        setCount(data.count);
        setLimit(data.limit);
        setPlan(data.plan);
        setLoadError(false);
      })
      .catch((err) => {
        console.warn("Could not load bookmarks:", err);
        if (!alive) return;
        setLoadError(true);
        setBookmarks([]);
      });

    return () => {
      alive = false;
    };
  }, []); // [] = run once when the page opens

  // ------------------------------------------------------------
  // Remove (step 1): clicking Remove only OPENS the HeroUI
  // confirm modal — nothing is removed at this point.
  // ------------------------------------------------------------
  const onRemove = (row: BookmarkRow) => {
    setRemoveTarget(row);
  };

  // ------------------------------------------------------------
  // Remove (step 2): the user confirmed INSIDE the modal
  // -> close the modal, call the API, drop it from the list.
  // ------------------------------------------------------------
  const confirmRemove = async () => {
    if (!removeTarget) return;
    const row = removeTarget;
    setRemoveTarget(null); // close the modal right away

    setBusyId(row.tuitionId);
    try {
      const result = await removeBookmark(row.tuitionId);
      // drop the removed bookmark from the list + fix the counter
      setBookmarks((list) =>
        (list ?? []).filter((x) => x.tuitionId !== row.tuitionId),
      );
      setCount((c) => Math.max(0, c - 1));
      toast.success(result.message || "Bookmark removed");
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not remove bookmark",
      );
    } finally {
      setBusyId(null);
    }
  };

  // friendly date, e.g. "19 Nov 2026"
  const savedOn = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // The plan pill: free students see their slots, pro sees "Unlimited"
  const planPill =
    plan === "pro" ? (
      <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
        ⭐ Pro plan: unlimited bookmarks
      </span>
    ) : (
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-bold ring-1 ${
          limit !== null && count >= limit
            ? "bg-rose-50 text-rose-700 ring-rose-200" // full
            : "bg-white text-emerald-700 ring-emerald-200"
        }`}
      >
        {count} of {limit ?? 5} bookmarks used
      </span>
    );

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Student Dashboard"
        sections={studentSections}
        // Fallback user while the session loads — the drawer
        // swaps in the REAL logged-in student automatically.
        user={{
          name: demoStudent.name,
          role: "Student",
          plan: demoStudent.plan,
        }}
      >
        <div className="mx-auto mt-16 max-w-5xl px-4">
          {/* ---------- Page heading ---------- */}
          <div className="mb-5 flex justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-emerald-700">
                MY BOOKMARKS
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
                Tuitions you saved for later
              </h1>
              <p className="mt-1.5 text-sm text-gray-600">
                Bookmark tuitions while you compare them — free accounts can
                save up to 5, Pro accounts unlimited.
              </p>

              {/* plan pill (count vs limit) — only once loaded */}
              {bookmarks !== null && !loadError && (
                <span className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    {bookmarks.length}{" "}
                    {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
                  </span>
                  {planPill}
                </span>
              )}
            </div>
            <div className="flex justify-center items-center">
              <Link
                href="/tuitions"
                className="text-center rounded bg-emerald-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Browse Tuitions
              </Link>
            </div>
          </div>

          {/* ==================================================
              1) ERROR — API not reachable
              ================================================== */}
          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Bookmark className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load your bookmarks
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
          ) : bookmarks === null ? (
            /* ---------- 2) LOADING (shared loader) ---------- */
            <LoadingSpinner label="Loading your bookmarks…" />
          ) : bookmarks.length === 0 ? (
            /* ---------- 3) EMPTY ---------- */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Bookmark className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                No bookmarks yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Open a tuition and press &quot;Bookmark&quot; to save it here
                for later — it stays until you remove it.
              </p>
              <Link
                href="/tuitions"
                className="mt-5 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Browse Tuitions
              </Link>
            </div>
          ) : (
            /* ---------- 4) THE LIST (card grid) ---------- */
            <ul className="space-y-4">
              {bookmarks.map((row) => (
                <li
                  key={row.id}
                  className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5"
                >
                  {row.tuition ? (
                    <>
                      {/* tuition title + status badge */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* banner thumbnail (plain img: any host) */}
                          {/* eslint-disable-next-line @next/next/no-img-element -- banner hosts vary */}
                          <img
                            src={row.tuition.image}
                            alt={row.tuition.title}
                            className="h-11 w-11 shrink-0 rounded-lg object-cover"
                          />
                          <div>
                            <h2 className="font-bold text-[#173D32]">
                              <Link
                                href={`/tuitions/${row.tuitionId}`}
                                className="underline-offset-2 hover:underline"
                              >
                                {row.tuition.title}
                              </Link>
                            </h2>
                            <p className="text-xs text-gray-500">
                              Bookmarked on {savedOn(row.bookmarkedAt)}
                            </p>
                          </div>
                        </div>
                        {/* inactive / unapproved listings are flagged */}
                        {!row.tuition.isActive ||
                        row.tuition.approvalStatus !== "approved" ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                            No longer available
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            {row.tuition.mode}
                          </span>
                        )}
                      </div>

                      {/* subject · class level · fee · tutor */}
                      <div className="mt-3 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2">
                        <p className="flex items-center gap-2">
                          <GraduationCap
                            size={14}
                            className="shrink-0 text-emerald-600"
                          />
                          {row.tuition.subject} · {row.tuition.classLevel}
                        </p>
                        <p className="flex items-center gap-2">
                          <User size={14} className="shrink-0 text-emerald-600" />
                          {row.tuition.tutorName}
                        </p>
                        <p className="flex items-center gap-2 sm:col-span-2">
                          <CalendarDays
                            size={14}
                            className="shrink-0 text-emerald-600"
                          />
                          Monthly fee:{" "}
                          <span className="font-semibold text-emerald-700">
                            ৳{row.tuition.fee.toLocaleString()}
                            <span className="font-normal text-gray-500">
                              {" "}
                              /month
                            </span>
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    /* the tuition was DELETED after being bookmarked */
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <GraduationCap size={18} />
                      </span>
                      <div>
                        <h2 className="font-bold text-slate-500">
                          This tuition was removed
                        </h2>
                        <p className="text-xs text-gray-500">
                          Bookmarked on {savedOn(row.bookmarkedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ---------- Remove + View actions ---------- */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === row.tuitionId}
                      onClick={() => onRemove(row)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-400 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <BookmarkX size={13} />
                      Remove Bookmark
                    </button>
                    {busyId === row.tuitionId && (
                      <span className="text-xs text-slate-400">Removing…</span>
                    )}
                    {row.tuition && (
                      <Link
                        href={`/tuitions/${row.tuitionId}`}
                        className="ml-auto text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* ==================================================
              REMOVE CONFIRM MODAL (HeroUI)
              Opens from the Remove button on any card — the
              bookmark is only deleted after the user confirms.
              ================================================== */}
          <Modal
            isOpen={removeTarget !== null}
            onOpenChange={(open) => {
              if (!open) setRemoveTarget(null);
            }}
          >
            <Modal.Backdrop>
              <Modal.Container placement="center">
                <Modal.Dialog>
                  <Modal.Header>
                    <Modal.Heading>Remove this bookmark?</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p className="text-sm text-slate-600">
                      Are you sure you want to remove{" "}
                      <span className="font-semibold text-slate-900">
                        &quot;
                        {removeTarget?.tuition?.title ?? "this tuition"}
                        &quot;
                      </span>{" "}
                      from your bookmarks? You can bookmark it again later
                      (while you still have a free slot).
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="flex w-full justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRemoveTarget(null)}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Keep Bookmark
                      </button>
                      <button
                        type="button"
                        onClick={confirmRemove}
                        className="cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                      >
                        Remove Bookmark
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
