import Link from "next/link";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import Image from "next/image";

// ============================================================
// The shape (fields) of ONE tuition listing.
// It matches the "tuitions" collection we will keep in MongoDB:
// only listings with status "approved" (admin approved them)
// and isActive true (listing is live) are shown to students.
// ============================================================
export type Tuition = {
  id: number;
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  fee: number;
  days: number;
  location: string;
  tutor: string;
  image: string;
  status: string; // "approved" = the admin approved this listing
  isActive: boolean; // true = the listing is active (not closed)
};

// ============================================================
// One tuition card — same design as the cards on the home page,
// so the site looks consistent everywhere.
// ============================================================
export default function TuitionCard({ tuition }: { tuition: Tuition }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* ---- Top: image with two badges on it ---- */}
      <div className="relative">
        {/* Card cover photo */}
        <Image
          src={tuition.image}
          alt={tuition.title}
          className="h-48 w-full object-cover"
        />
        {/* Mode badge: Online = green, Offline = amber (same as home) */}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${
            tuition.mode === "Online" ? "bg-emerald-600" : "bg-amber-500"
          }`}
        >
          {tuition.mode}
        </span>
        {/* Subject chip at the bottom-left of the image */}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          {tuition.subject}
        </span>
      </div>

      {/* ---- Middle: title, class level, tutor, location, schedule ---- */}
      <div className="flex flex-grow flex-col p-5">
        {/* Tuition title */}
        <h3 className="text-lg font-bold leading-snug text-slate-900">
          {tuition.title}
        </h3>
        {/* Class level line */}
        <p className="mt-2 text-sm text-slate-600">
          Class Level: {tuition.classLevel}
        </p>

        {/* Small info list: tutor, location, days per week */}
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          {/* Tutor name with a letter avatar */}
          <p className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              {tuition.tutor.charAt(0)}
            </span>
            {tuition.tutor}
          </p>
          {/* Location */}
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            {tuition.location}
          </p>
          {/* Weekly schedule */}
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {tuition.days} days / week
          </p>
        </div>

        {/* ---- Bottom: monthly fee + "View Details" link ----
            mt-auto pushes this row to the bottom so every card
            lines up even when the titles have different lengths. */}
        <div className="mt-auto">
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
            {/* Monthly fee in emerald */}
            <p>
              <span className="text-xl font-extrabold text-emerald-600">
                ৳{tuition.fee.toLocaleString()}
              </span>
              <span className="text-sm text-slate-600"> /month</span>
            </p>
            {/* TODO (for you, later): build the details page
                /tuitions/[id] — until then this link shows a 404 */}
            <Link
              href={`/tuitions/${tuition.id}`}
              className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-600"
            >
              View Details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
