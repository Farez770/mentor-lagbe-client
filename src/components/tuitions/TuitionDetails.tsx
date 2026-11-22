"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  GraduationCap,
  Lock,
  MapPin,
  Monitor,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading";
import { Modal, toast } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { getTuition, type PostedTuition } from "@/lib/api/tuitions";
import { applyForTuition } from "@/lib/api/applications";
import {
  checkBookmark,
  addBookmark,
  removeBookmark,
} from "@/lib/api/bookmarks";


type LoadState = "loading" | "ready" | "notfound" | "error";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
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
  const router = useRouter();
  const [tuition, setTuition] = useState<PostedTuition | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
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
        setState(err.status === 404 ? "notfound" : "error");
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const { data: session, isPending } = authClient.useSession();

  const role = (session?.user?.role as string | undefined) || "student";
  const isBlocked = !isPending && !!session && role !== "student";

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyPending, setApplyPending] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: "",
    email: "",
    phone: "",
    schedule: "",
    note: "",
  });

  const updateApply = (key: keyof typeof applyForm, value: string) =>
    setApplyForm((f) => ({ ...f, [key]: value }));

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  useEffect(() => {
    if (state !== "ready" || isPending) return;
    if (!session?.user || role !== "student") return;

    let alive = true;
    checkBookmark(id)
      .then((data) => {
        if (alive) setIsBookmarked(data.bookmarked);
      })
      .catch(() => {
      });
    return () => {
      alive = false;
    };
  }, [state, isPending, session, role, id]);

  const onBookmarkToggle = async () => {
    if (bookmarkBusy) return;
    setBookmarkBusy(true);
    try {
      if (isBookmarked) {
        const result = await removeBookmark(id);
        setIsBookmarked(false);
        toast.success(result.message || "Bookmark removed");
      } else {
        const result = await addBookmark(id);
        setIsBookmarked(true);
        toast.success(result.message || "Tuition bookmarked!");
      }
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not update bookmark",
      );
    } finally {
      setBookmarkBusy(false);
    }
  };

  useEffect(() => {
    if (state !== "ready" || isPending) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get("apply") !== "1") return;

    if (!session?.user) {
      const destination = `/tuitions/${encodeURIComponent(id)}?apply=1`;
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(destination)}`);
      return;
    }

    if (role !== "student") {
      url.searchParams.delete("apply");
      window.history.replaceState(
        window.history.state,
        "",
        url.pathname + url.search + url.hash,
      );
      return;
    }

    const user = session.user as {
      name?: string;
      email?: string;
      phone?: string;
    };

    const timeoutId = window.setTimeout(() => {
      setApplyForm((previous) => ({
        ...previous,
        name: previous.name || user.name || "",
        email: previous.email || user.email || "",
        phone: previous.phone || user.phone || "",
      }));
      setApplyOpen(true);

      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("apply");
      window.history.replaceState(
        window.history.state,
        "",
        currentUrl.pathname + currentUrl.search + currentUrl.hash,
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [state, isPending, session, role, id, router]);

  const onApplySubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (applyForm.name.trim().length < 2) {
      toast.warning("Please enter your name");
      return;
    }
    if (!applyForm.email.includes("@")) {
      toast.warning("Please enter a valid email");
      return;
    }
    if (!applyForm.phone.trim()) {
      toast.warning("Please enter your phone number");
      return;
    }
    if (!applyForm.schedule.trim()) {
      toast.warning("Please enter your preferred schedule");
      return;
    }

    setApplyPending(true);
    try {
      const result = await applyForTuition({
        tuitionId: id,
        studentName: applyForm.name.trim(),
        studentEmail: applyForm.email.trim(),
        studentPhone: applyForm.phone.trim(),
        preferredSchedule: applyForm.schedule.trim(),
        note: applyForm.note.trim(),
      });
      toast.success(result.message || "Application sent!");
      setHasApplied(true);
      setApplyOpen(false); // close the modal
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not send application",
      );
    } finally {
      setApplyPending(false);
    }
  };

  const backLink = (
    <Link
      href="/tuitions"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Browse
    </Link>
  );

  if (state === "loading") {
    return (
      <section className="bg-slate-50 py-20">
        <LoadingSpinner label="Loading tuition details…" />
      </section>
    );
  }

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

  const postedOn = new Date(tuition.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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

  const inputClass =
    "h-10 w-full rounded-lg border border-emerald-300 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <section className="bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        {backLink}

        <div className="relative mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <img
            src={tuition.image}
            alt={tuition.title}
            className="h-64 w-full object-cover md:h-96"
          />
          <span
            className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold text-white ${
              tuition.mode === "Online" ? "bg-emerald-600" : "bg-amber-500"
            }`}
          >
            {tuition.mode}
          </span>
          <span
            className={`absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold text-white ${statusClass}`}
          >
            {statusLabel}
          </span>
          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
            {tuition.subject}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
              {tuition.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-slate-600">
              {tuition.tutorImage ? (
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
              {tuition.tutorVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Pro Tutor
                </span>
              )}
              <span className="text-slate-300">•</span>
              <span>Posted on {postedOn}</span>
            </div>
          </div>

          <p className="rounded-2xl bg-emerald-50 px-5 py-3 ring-1 ring-emerald-100">
            <span className="text-2xl font-extrabold text-emerald-600">
              ৳{tuition.fee.toLocaleString()}
            </span>
            <span className="text-sm text-slate-600"> /month</span>
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">
              About this tuition
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 md:text-base">
              {tuition.description}
            </p>
          </div>

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
              <InfoRow icon={BadgeCheck} label="Status" value={statusLabel} />
            </ul>

            {isBlocked && (
              <p className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium leading-relaxed text-amber-700 ring-1 ring-amber-200">
                <Lock size={14} className="mt-0.5 shrink-0" />
                <span>
                  Only student accounts can apply for tuitions. You&apos;re
                  signed in as a{" "}
                  <span className="font-bold">
                    {role === "admin" ? "Admin" : "Tutor"}
                  </span>
                  .
                </span>
              </p>
            )}

            <button
              type="button"
              disabled={isBlocked || bookmarkBusy || isPending}
              onClick={() => {
                if (isPending) return; // session still loading — wait
                if (isBlocked) return; // safety — already disabled
                if (!session) {
                  router.push(
                    `/sign-in?callbackUrl=${encodeURIComponent(`/tuitions/${id}`)}`,
                  );
                  return;
                }
                void onBookmarkToggle();
              }}
              className={`mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed ${
                isBookmarked
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-300 hover:bg-amber-100 disabled:opacity-60"
                  : "border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50 disabled:border-slate-200 disabled:text-slate-400"
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  Bookmarked ✓
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  Bookmark
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              {isBlocked
                ? "Bookmarks are disabled for your account type"
                : isBookmarked
                  ? "Saved to My Bookmarks — click to remove"
                  : "Free plan: up to 5 bookmarks · Pro: unlimited"}
            </p>

            <button
              type="button"
              disabled={hasApplied || isBlocked}
              onClick={() => {
                if (isPending) return; // session still loading — wait
                if (isBlocked) return; // safety — already disabled
                if (!session) {
                  const destination = `/tuitions/${encodeURIComponent(id)}?apply=1`;
                  router.push(
                    `/sign-in?callbackUrl=${encodeURIComponent(destination)}`,
                  );
                  return;
                }
                const u = session.user as {
                  name?: string;
                  email?: string;
                  phone?: string;
                };
                setApplyForm((f) => ({
                  ...f,
                  name: f.name || u.name || "",
                  email: f.email || u.email || "",
                  phone: f.phone || u.phone || "",
                }));
                setApplyOpen(true);
              }}
              className="mt-6 w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {hasApplied ? "✓ Application Sent" : "Apply Now"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              {hasApplied
                ? "The tutor will review your application"
                : isBlocked
                  ? "Applying is disabled for your account type"
                  : "Send a short form — the tutor reviews it in their dashboard"}
            </p>
          </div>
        </div>

        <Modal
          isOpen={applyOpen}
          onOpenChange={(open) => {
            if (!open) setApplyOpen(false);
          }}
        >
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Apply for this tuition</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p className="mb-3 text-sm text-slate-600">
                    {tuition.title} · by {tuition.tutorName}
                  </p>

                  <form
                    id="apply-form"
                    onSubmit={onApplySubmit}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-800">
                        Your Name *
                      </span>
                      <input
                        value={applyForm.name}
                        onChange={(e) => updateApply("name", e.target.value)}
                        placeholder="e.g. Rahat Karim"
                        className={inputClass}
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-gray-800">
                        Email *
                      </span>
                      <input
                        type="email"
                        value={applyForm.email}
                        onChange={(e) => updateApply("email", e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-gray-800">
                        Phone *
                      </span>
                      <input
                        value={applyForm.phone}
                        onChange={(e) => updateApply("phone", e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className={inputClass}
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-gray-800">
                        Preferred Schedule *
                      </span>
                      <input
                        value={applyForm.schedule}
                        onChange={(e) =>
                          updateApply("schedule", e.target.value)
                        }
                        placeholder="e.g. Sat–Wed, 7:00 PM"
                        className={inputClass}
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-sm font-semibold text-gray-800">
                        Note{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </span>
                      <textarea
                        rows={3}
                        value={applyForm.note}
                        onChange={(e) => updateApply("note", e.target.value)}
                        placeholder="Why are you a good fit? Anything the tutor should know..."
                        className={inputClass + " h-auto py-2"}
                      />
                    </label>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <div className="flex w-full justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setApplyOpen(false)}
                      disabled={applyPending}
                      className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="apply-form"
                      disabled={applyPending}
                      className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {applyPending ? "Sending..." : "Send Application"}
                    </button>
                  </div>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>
    </section>
  );
}
