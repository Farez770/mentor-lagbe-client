"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading"; // shared loading UI
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import TuitionCard, { type Tuition } from "@/components/tuitions/TuitionCard";
import { getTuitions } from "@/lib/api/tuitions";

// ============================================================
// REAL TUITION DATA — fetched from GET /api/tuitions
// (the old 9-item demo array is gone; the grid below shows
// whatever tutors have actually posted to the database)
// ============================================================

// ============================================================
// The Browse Tuitions page content:
// heading -> search + filter toolbar -> grid of cards
// ============================================================
export default function BrowseTuitions() {
  // ---- Filter states (what the user has chosen so far) ----
  // search   = text typed into the search box
  // subject  = chosen subject dropdown value ("all" = no filter)
  // classLevel = chosen class level dropdown value
  // mode     = chosen Online/Offline dropdown value
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [classLevel, setClassLevel] = useState("all");
  const [mode, setMode] = useState("all");

  // ============================================================
  // REAL tuitions from GET /api/tuitions.
  // The list starts empty and isLoading shows a spinner until
  // the API answers (or the empty state on failure).
  // ============================================================
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getTuitions()
      .then((data) => {
        if (!alive) return;
        // The API shape (tutorName, approvalStatus) is mapped
        // to the card's shape (tutor, status)
        setTuitions(
          data.tuitions.map((item) => ({
            id: item.id,
            title: item.title,
            subject: item.subject,
            classLevel: item.classLevel,
            mode: item.mode,
            fee: item.fee,
            days: item.days,
            location: item.location,
            tutor: item.tutorName,
            image: item.image,
            status: item.approvalStatus,
            isActive: item.isActive,
          })),
        );
      })
      .catch((err) => {
        // e.g. API server not running → show the empty state
        console.warn("Could not load tuitions:", err);
        if (alive) setTuitions([]);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run once when the page opens

  // ---- Build the dropdown options from the data itself ----
  // new Set(...) removes duplicate values, the spread [...set]
  // turns it back into an array, and "all" is added at the front
  // so the first option always means "show everything".
  const subjectOptions = [
    "all",
    ...new Set(tuitions.map((tuition) => tuition.subject)),
  ];
  const classLevelOptions = [
    "all",
    ...new Set(tuitions.map((tuition) => tuition.classLevel)),
  ];
  const modeOptions = [
    "all",
    ...new Set(tuitions.map((tuition) => tuition.mode)),
  ];

  // Lowercased search text once, so the comparisons below are easy
  const keyword = search.trim().toLowerCase();

  // ---- The filtering (this is the heart of the page) ----
  // Keep a tuition only when it passes EVERY check below.
  const filteredTuitions = tuitions.filter((tuition) => {
    // 1) ONLY approved + active listings are public. The API
    //    (GET /api/tuitions) already returns just those — this
    //    second check is a safety net so a pending/rejected or
    //    closed post can never leak onto this page.
    if (tuition.status !== "approved") return false;
    if (!tuition.isActive) return false;

    // 2) Search box: the keyword must appear in the title,
    //    subject, tutor name or class level (or box is empty)
    const matchesSearch =
      keyword === "" ||
      tuition.title.toLowerCase().includes(keyword) ||
      tuition.subject.toLowerCase().includes(keyword) ||
      tuition.tutor.toLowerCase().includes(keyword) ||
      tuition.classLevel.toLowerCase().includes(keyword);

    // 3) Subject dropdown: "all" means don't filter by subject
    const matchesSubject = subject === "all" || tuition.subject === subject;

    // 4) Class level dropdown: "all" means don't filter by class
    const matchesClass =
      classLevel === "all" || tuition.classLevel === classLevel;

    // 5) Mode dropdown: "all" means don't filter by Online/Offline
    const matchesMode = mode === "all" || tuition.mode === mode;

    // Keep the card only if the search + every dropdown matches
    return matchesSearch && matchesSubject && matchesClass && matchesMode;
  });

  // True when the user has typed or selected anything at all
  // (used to decide whether to show the "Clear Filters" button)
  const hasActiveFilter =
    search !== "" ||
    subject !== "all" ||
    classLevel !== "all" ||
    mode !== "all";

  // Reset every filter back to its starting value
  const clearFilters = () => {
    setSearch("");
    setSubject("all");
    setClassLevel("all");
    setMode("all");
  };

  // Shared style for the three dropdowns
  const selectClass =
    "w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Same heading style as every other section on the site */}
        <SectionHeading
          tagline="Browse Tuitions"
          title="Find Your Perfect Tuition"
          description="Search and filter live tuition listings by subject, class level and mode — everything you see here is a real, active tuition post."
        />

        {/* ====================================================
            TOOLBAR: search box + 3 dropdown filters + counters
            ==================================================== */}
        <FadeIn className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          {/* ---- Search box ---- */}
          <div className="relative">
            {/* Search icon, sitting inside the input on the left */}
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            {/* Controlled input: value comes from state, onChange
                updates that state on every keystroke */}
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by tuition title, subject or tutor name..."
              aria-label="Search tuitions"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* ---- Three dropdown filters side by side ---- */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Subject dropdown */}
            <div className="relative">
              <label
                htmlFor="subject-filter"
                className="mb-1 block text-xs font-semibold text-slate-500"
              >
                Subject
              </label>
              <select
                id="subject-filter"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={selectClass}
              >
                {subjectOptions.map((option) => (
                  <option key={option} value={option}>
                    {/* "all" gets a friendlier label */}
                    {option === "all" ? "All Subjects" : option}
                  </option>
                ))}
              </select>
              {/* Down arrow icon on the right of the dropdown */}
              <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Class level dropdown */}
            <div className="relative">
              <label
                htmlFor="class-filter"
                className="mb-1 block text-xs font-semibold text-slate-500"
              >
                Class Level
              </label>
              <select
                id="class-filter"
                value={classLevel}
                onChange={(event) => setClassLevel(event.target.value)}
                className={selectClass}
              >
                {classLevelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All Classes" : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Online / Offline mode dropdown */}
            <div className="relative">
              <label
                htmlFor="mode-filter"
                className="mb-1 block text-xs font-semibold text-slate-500"
              >
                Mode
              </label>
              <select
                id="mode-filter"
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className={selectClass}
              >
                {modeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "Online & Offline" : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* ---- Bottom row: how many results + Clear button ---- */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {/* Live result counter */}
            <p className="text-sm text-slate-600">
              {isLoading ? (
                "Loading tuitions…"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-bold text-slate-900">
                    {filteredTuitions.length}
                  </span>{" "}
                  of {tuitions.length} tuitions
                </>
              )}
            </p>

            {/* Clear button only appears when a filter is active */}
            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-600 hover:text-emerald-600"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </FadeIn>

        {/* ====================================================
            RESULTS: loading spinner → "nothing posted yet" →
            "no match for your filters" → the grid
            ==================================================== */}
        {isLoading ? (
          /* ---- Still fetching from the API (shared loader) ---- */
          <LoadingSpinner label="Loading tuitions…" />
        ) : tuitions.length === 0 ? (
          /* ---- The API has no active tuitions at all ---- */
          <FadeIn className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No tuitions available yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              There are no live tuition listings right now — check back soon!
            </p>
          </FadeIn>
        ) : filteredTuitions.length === 0 ? (
          /* ---- Empty state: nothing matched the search/filters ---- */
          <FadeIn className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No tuitions found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              We couldn&apos;t find anything matching your search. Try different
              keywords or clear the filters to see everything again.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Clear All Filters
            </button>
          </FadeIn>
        ) : (
          /* ---- The grid: 1 column on mobile, 2 on tablet, 3 on desktop ---- */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTuitions.map((tuition, index) => (
              <FadeIn key={tuition.id} delay={index * 0.08} className="h-full">
                <TuitionCard tuition={tuition} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
