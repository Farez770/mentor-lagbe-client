"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  Loader2,
  MapPin,
  Monitor,
} from "lucide-react";
import { toast } from "@heroui/react";
import { getTuition, type PostedTuition } from "@/lib/api/tuitions";

// ============================================================
// TUITION VIEW DETAILS (/tuitions/[id])
//
// Loads ONE tuition from GET /api/tuitions/:id and shows the
// full listing: banner, title, tutor, description and every
// fact (class level, mode, location, schedule, fee, status).
//
// Four states: loading → ready / not found / error.
// ============================================================

// Which of the four states the page is in right now
type LoadState = "loading" | "ready" | "notfound" | "error";

// One row in the "Tuition Information" card
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap; // a lucide icon component
  label: string; // e.g. "Class Level"
  value: string; // e.g. "Class 9-10"
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </li>
  );
}

export default function TuitionDetails({ id }: { id: string }) {
  const [tuition, setTuition] = useState<PostedTuition | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  // ---- load the tuition whenever the id is known ----
  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getTuition(id)
      .then((data) => {
        if (!alive) return;
        setTuition(data.tuition);
        setState("ready");
      })
      .catch((err: Error & { status?: number }) => {
        if (!alive) return;
        console.warn("Could not load tuition:", err);
        // 404 = this id does not exist (or is not active)
        setState(err.status === 404 ? "notfound" : "error");
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, [id]); // re-run if the id ever changes

  // ---- shared piece: the "back" link on every state ----
  const backLink = (
    <Link
      href="/tuitions"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Browse
    </Link>
  );

  // ============================================================
  // STATE 1: still loading
  // ============================================================
  if (state === "loading") {
    return (
      <section className="bg-slate-50 py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Loading tuition details…</p>
        </div>
      </section>
    );
  }

  // ============================================================
  // STATE 2: this tuition does not exist (404)
  // ============================================================
  if (state === "notfound" || !tuition) {
    return (
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Tuition not found
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              This tuition listing does not exist or is no longer active.
            </p>
            <div className="mt-6">{backLink}</div>
          </div>
        </div>
      </section>
    );
  }

  // ============================================================
  // STATE 3: something went wrong (e.g. API server is off)
  // ============================================================
  if (state === "error") {
    return (
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <MapPin className="mx-auto h-10 w-10 text-slate-300" />
            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Could not load this tuition
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Something went wrong while talking to the server. Check that the
              API server is running, then try again.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
              {backLink}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ============================================================
  // STATE 4: READY — the full details
  // ============================================================
  // Friendly posted date, e.g. "19 Nov 2026"
  const postedOn = new Date(tuition.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Status badge color: pending = amber, approved = green, rejected = red
  const statusLabel =
    tuition.approvalStatus === "approved"
      ? "Approved"
      : tuition.approvalStatus === "rejected"
        ? "Rejected"
        : "Pending Approval";
  const statusClass =
    tuition.approvalStatus === "approved"
      ? "bg-emerald-600"
      : tuition.approvalStatus === "rejected"
        ? "bg-rose-600"
        : "bg-amber-500";

  return (
    <section className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        {backLink}

        {/* ---- Banner image with badges ---- */}
        <div className="relative mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Plain <img> on purpose: the banner URL comes from
              the database and could be any host, which would
              crash next/image (its remote hosts are allowlisted) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- banner hosts vary */}
          <img
            src={tuition.image}
            alt={tuition.title}
            className="h-64 w-full object-cover md:h-96"
          />
          {/* Mode badge: Online = green, Offline = amber */}
          <span
            className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold text-white ${
              tuition.mode === "Online" ? "bg-emerald-600" : "bg-amber-500"
            }`}
          >
            {tuition.mode}
          </span>
          {/* Approval status badge (admin approves in Phase 5) */}
          <span
            className={`absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold text-white ${statusClass}`}
          >
            {statusLabel}
          </span>
          {/* Subject chip at the bottom-left */}
          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
            {tuition.subject}
          </span>
        </div>

        {/* ---- Title + tutor + fee ---- */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
              {tuition.title}
            </h1>
            {/* Tutor row: photo (or first letter) + name + date */}
            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-slate-600">
              {tuition.tutorImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- profile photos can come from any domain
                <img
                  src={tuition.tutorImage}
                  alt={tuition.tutorName}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {tuition.tutorName.charAt(0)}
                </span>
              )}
              <span className="font-semibold text-slate-800">
                {tuition.tutorName}
              </span>
              <span className="text-slate-300">•</span>
              <span>Posted on {postedOn}</span>
            </div>
          </div>

          {/* Monthly fee highlight */}
          <p className="rounded-2xl bg-emerald-50 px-5 py-3 ring-1 ring-emerald-100">
            <span className="text-2xl font-extrabold text-emerald-600">
              ৳{tuition.fee.toLocaleString()}
            </span>
            <span className="text-sm text-slate-600"> /month</span>
          </p>
        </div>

        {/* ---- Two columns: description + information card ---- */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Description (2/3 width) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">
              About this tuition
            </h2>
            {/* whitespace-pre-line keeps the line breaks the tutor typed */}
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 md:text-base">
              {tuition.description}
            </p>
          </div>

          {/* Information card (1/3 width) */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Tuition Information
            </h2>

            <ul className="mt-4 space-y-4">
              <InfoRow
                icon={GraduationCap}
                label="Class Level"
                value={tuition.classLevel}
              />
              <InfoRow
                icon={Monitor}
                label="Teaching Mode"
                value={tuition.mode}
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={tuition.location}
              />
              <InfoRow
                icon={CalendarDays}
                label="Schedule"
                value={`${tuition.days} days / week`}
              />
              <InfoRow
                icon={BadgeCheck}
                label="Status"
                value={statusLabel}
              />
            </ul>

            {/* Apply button — the application flow arrives in
                Phase 3 (applications collection), so for now it
                shows a friendly toast instead of doing nothing */}
            <button
              type="button"
              onClick={() =>
                toast.warning(
                  "Applications open soon — this arrives in the next step!",
                )
              }
              className="mt-6 w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
            >
              Apply Now
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              Students will be able to apply from this page
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
