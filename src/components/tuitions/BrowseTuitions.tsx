"use client";

import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import FadeIn from "@/components/shared/FadeIn";
import TuitionCard, { type Tuition } from "@/components/tuitions/TuitionCard";

// ============================================================
// DEMO TUITION DATA (design only — no backend yet).
// Every item already has status "approved" and isActive true,
// because the requirement says the Browse page only shows
// listings that the Admin approved AND that are active.
// ============================================================
// TODO (for you, later): when the backend is ready, delete this
// array and fetch real data instead, for example:
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tuitions`);
//   const tuitions = await res.json();
// (the API should already return only approved + active listings)
// ============================================================
const tuitions: Tuition[] = [
  {
    id: 1,
    title: "Class 9-10 Physics Crash Batch",
    subject: "Physics",
    classLevel: "Class 9-10",
    mode: "Online",
    fee: 2500,
    days: 3,
    location: "Online (Zoom)",
    tutor: "Rahat Karim",
    image:
      "https://images.unsplash.com/photo-1636466024490-28f0b46a5b5c?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 2,
    title: "SSC Math Special Care Batch",
    subject: "Mathematics",
    classLevel: "Class 9-10",
    mode: "Offline",
    fee: 3000,
    days: 4,
    location: "Dhanmondi, Dhaka",
    tutor: "Nusrat Jahan",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 3,
    title: "HSC Chemistry Masterclass",
    subject: "Chemistry",
    classLevel: "Class 11-12",
    mode: "Online",
    fee: 3500,
    days: 3,
    location: "Online (Google Meet)",
    tutor: "Tanvir Ahmed",
    image:
      "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 4,
    title: "English Grammar Foundation Batch",
    subject: "English",
    classLevel: "Class 6-8",
    mode: "Offline",
    fee: 2000,
    days: 2,
    location: "Uttara, Dhaka",
    tutor: "Farhana Islam",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 5,
    title: "JavaScript & React for Beginners",
    subject: "Programming",
    classLevel: "Adults",
    mode: "Online",
    fee: 4000,
    days: 3,
    location: "Online (Zoom)",
    tutor: "Mahin Hasan",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 6,
    title: "IELTS Guaranteed 7+ Band Program",
    subject: "IELTS",
    classLevel: "Adults",
    mode: "Online",
    fee: 6000,
    days: 5,
    location: "Online (Zoom)",
    tutor: "Sadia Rahman",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 7,
    title: "HSC Biology 1st Part Suggestion",
    subject: "Biology",
    classLevel: "Class 11-12",
    mode: "Offline",
    fee: 3200,
    days: 4,
    location: "Mirpur, Dhaka",
    tutor: "Imran Hossain",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 8,
    title: "Class 6-8 Bangla Writing Practice",
    subject: "Bangla",
    classLevel: "Class 6-8",
    mode: "Online",
    fee: 1800,
    days: 2,
    location: "Online (Zoom)",
    tutor: "Sumaiya Akter",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    status: "approved",
    isActive: true,
  },
  {
    id: 9,
    title: "ICT Admission Prep (Public University)",
    subject: "ICT",
    classLevel: "Admission",
    mode: "Offline",
    fee: 4500,
    days: 5,
    location: "Farmgate, Dhaka",
    tutor: "Shakib Rahman",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    status: "approved",
    isActive: true,
  },
];

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
  const modeOptions = ["all", ...new Set(tuitions.map((tuition) => tuition.mode))];

  // Lowercased search text once, so the comparisons below are easy
  const keyword = search.trim().toLowerCase();

  // ---- The filtering (this is the heart of the page) ----
  // Keep a tuition only when it passes EVERY check below.
  const filteredTuitions = tuitions.filter((tuition) => {
    // 1) Requirement: only Admin-approved AND active listings
    if (tuition.status !== "approved" || !tuition.isActive) return false;

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
    <section className="bg-slate-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Same heading style as every other section on the site */}
        <SectionHeading
          tagline="Browse Tuitions"
          title="Find Your Perfect Tuition"
          description="Search and filter all approved tuition listings by subject, class level and mode — only live, admin-approved tuitions are shown here."
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
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredTuitions.length}
              </span>{" "}
              of {tuitions.length} approved tuitions
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
            RESULTS: grid of cards, or the empty state
            ==================================================== */}
        {filteredTuitions.length === 0 ? (
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
              <FadeIn
                key={tuition.id}
                delay={index * 0.08}
                className="h-full"
              >
                <TuitionCard tuition={tuition} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
