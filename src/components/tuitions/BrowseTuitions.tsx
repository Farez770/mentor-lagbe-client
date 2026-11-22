"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, X } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import TuitionCard, { type Tuition } from "@/components/tuitions/TuitionCard";
import {
  getTuitions,
  type TuitionFacets,
} from "@/lib/api/tuitions";


const EMPTY_FACETS: TuitionFacets = {
  subjects: [],
  classLevels: [],
  modes: [],
};

function withAllOption(values: string[]) {
  return [
    "all",
    ...values.filter((value) => value.toLowerCase() !== "all"),
  ];
}

export default function BrowseTuitions() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramsString = searchParams.toString();
  const q = searchParams.get("q") ?? "";
  const subject = searchParams.get("subject") ?? "all";
  const classLevel = searchParams.get("classLevel") ?? "all";
  const mode = searchParams.get("mode") ?? "all";

  const [searchInput, setSearchInput] = useState(q);
  const [lastSyncedQ, setLastSyncedQ] = useState(q);

  if (q !== lastSyncedQ) {
    setLastSyncedQ(q);
    setSearchInput(q);
  }

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

  useEffect(() => {
    if (searchInput === q) return;

    const timer = window.setTimeout(() => {
      commitParams({ q: searchInput });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, q, commitParams]);

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [facets, setFacets] = useState<TuitionFacets>(EMPTY_FACETS);
  const [matchedTotal, setMatchedTotal] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    getTuitions({ q, subject, classLevel, mode })
      .then((data) => {
        if (!alive) return;

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

    return () => {
      alive = false;
    };
  }, [q, subject, classLevel, mode]);

  const visibleTuitions = tuitions.filter(
    (tuition) => tuition.status === "approved" && tuition.isActive,
  );

  const subjectOptions = withAllOption(facets.subjects);
  const classLevelOptions = withAllOption(facets.classLevels);
  const modeOptions = withAllOption(facets.modes);

  const hasActiveFilter =
    searchInput !== "" ||
    subject !== "all" ||
    classLevel !== "all" ||
    mode !== "all";

  const clearFilters = () => {
    setSearchInput("");
    commitParams({
      q: "",
      subject: "all",
      classLevel: "all",
      mode: "all",
    });
  };

  const selectClass =
    "w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          tagline="Browse Tuitions"
          title="Find Your Perfect Tuition"
          description="Search and filter live tuition listings by subject, class level and mode — everything you see here is a real, active tuition post."
        />

        <FadeIn className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by tuition title, subject, tutor or class..."
              aria-label="Search tuitions"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    {option === "all" ? "All Subjects" : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-slate-400" />
            </div>

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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
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

        {isLoading ? (
          <LoadingSpinner label="Loading tuitions…" />
        ) : totalAvailable === 0 ? (
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
