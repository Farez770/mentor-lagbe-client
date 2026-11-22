"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, X } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading"; // shared loading UI
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import TuitionCard, { type Tuition } from "@/components/tuitions/TuitionCard";
import {
  getTuitions,
  type TuitionFacets,
} from "@/lib/api/tuitions";

// ============================================================
// CHALLENGE 1: SERVER-SIDE SEARCH + FILTER
//
// This component no longer filters a big array in the browser.
// Instead, every search/filter choice is written into the URL
// (e.g. /tuitions?q=physics&subject=Physics&mode=Online) and
// getTuitions() sends those values to Express as query params.
// MongoDB does the filtering and returns only matching rows.
//
// Keeping the values in the URL also means a filtered result page
// can be bookmarked, shared, refreshed, or used with back/forward.
// ============================================================

const EMPTY_FACETS: TuitionFacets = {
  subjects: [],
  classLevels: [],
  modes: [],
};

// Always show "All ..." first, then the values coming from the API.
function withAllOption(values: string[]) {
  return [
    "all",
    ...values.filter((value) => value.toLowerCase() !== "all"),
  ];
}

// ============================================================
// The Browse Tuitions page content:
// heading -> search + filter toolbar -> grid of cards
// ============================================================
export default function BrowseTuitions() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- Filter values live in the URL (single source of truth) ----
  const paramsString = searchParams.toString();
  const q = searchParams.get("q") ?? "";
  const subject = searchParams.get("subject") ?? "all";
  const classLevel = searchParams.get("classLevel") ?? "all";
  const mode = searchParams.get("mode") ?? "all";

  // The text input needs a tiny local state so typing feels instant.
  // After 350ms of inactivity it is written back into the URL.
  const [searchInput, setSearchInput] = useState(q);
  const [lastSyncedQ, setLastSyncedQ] = useState(q);

  // Keep the input in sync when the URL changes (back/forward,
  // "Clear Filters", or a link someone pasted into the address bar).
  // React recommends adjusting state during render for this exact
  // "mirror a prop into state" case — it avoids a cascading effect.
  if (q !== lastSyncedQ) {
    setLastSyncedQ(q);
    setSearchInput(q);
  }

  // Update one or more query params without losing the others.
  // Empty and "all" values are removed instead of written as junk.
  const commitParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(paramsString);

      Object.entries(updates).forEach(([key, value]) => {
        const clean = value.trim();
        if (!clean || clean.toLowerCase() === "all") {
          params.delete(key);
        } else {
          params.set(key, clean);
        }
      });

      const query = params.toString();
      router.replace(query ? `/tuitions?${query}` : "/tuitions", {
        scroll: false,
      });
    },
    [paramsString, router],
  );

  // Debounce the search box so we do not call the API on every keystroke.
  useEffect(() => {
    if (searchInput === q) return;

    const timer = window.setTimeout(() => {
      commitParams({ q: searchInput });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, q, commitParams]);

  // ============================================================
  // REAL tuitions from GET /api/tuitions.
  // The list starts empty and isLoading shows a spinner until
  // the API answers (or the empty state on failure).
  // ============================================================
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [facets, setFacets] = useState<TuitionFacets>(EMPTY_FACETS);
  const [matchedTotal, setMatchedTotal] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    // Every argument here becomes a URL query param on the backend.
    getTuitions({ q, subject, classLevel, mode })
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
        setFacets(data.facets ?? EMPTY_FACETS);
        setMatchedTotal(data.total ?? data.tuitions.length);
        setTotalAvailable(data.totalAvailable ?? data.tuitions.length);
      })
      .catch((err) => {
        // e.g. API server not running → show the empty state
        console.warn("Could not load tuitions:", err);
        if (alive) {
          setTuitions([]);
          setMatchedTotal(0);
          setTotalAvailable(0);
        }
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    // cleanup: never set state after unmount, and cancel a slow
    // request as soon as the user changes a filter
    return () => {
      alive = false;
    };
  }, [q, subject, classLevel, mode]);

  // Safety net: even though the API already returns only approved +
  // active rows, never render a pending/rejected/closed listing here.
  const visibleTuitions = tuitions.filter(
    (tuition) => tuition.status === "approved" && tuition.isActive,
  );

  // Dropdown choices come from the server's UNFILTERED public data,
  // so picking one option does not remove the other options.
  const subjectOptions = withAllOption(facets.subjects);
  const classLevelOptions = withAllOption(facets.classLevels);
  const modeOptions = withAllOption(facets.modes);

  // True when the user has typed or selected anything at all
  // (used to decide whether to show the "Clear Filters" button)
  const hasActiveFilter =
    searchInput !== "" ||
    subject !== "all" ||
    classLevel !== "all" ||
    mode !== "all";

  // Reset every filter back to its starting value
  const clearFilters = () => {
    setSearchInput("");
    commitParams({
      q: "",
      subject: "all",
      classLevel: "all",
      mode: "all",
    });
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
            {/* Controlled input: value comes from local state so typing
                is instant; the debounced effect writes it to the URL. */}
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by tuition title, subject, tutor or class..."
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
                onChange={(event) =>
                  commitParams({ subject: event.target.value })
                }
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
                onChange={(event) =>
                  commitParams({ classLevel: event.target.value })
                }
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
                onChange={(event) => commitParams({ mode: event.target.value })}
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
            {/* Live result counter — numbers come from the server */}
            <p className="text-sm text-slate-600">
              {isLoading ? (
                "Loading tuitions…"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-bold text-slate-900">
                    {matchedTotal}
                  </span>{" "}
                  of {totalAvailable} tuitions
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
        ) : totalAvailable === 0 ? (
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
        ) : visibleTuitions.length === 0 ? (
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
            {visibleTuitions.map((tuition, index) => (
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
