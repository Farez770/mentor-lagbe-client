import Link from "next/link";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import Image from "next/image";

export type Tuition = {
  id: string | number;
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  fee: number;
  days: number;
  location: string;
  tutor: string;
  image: string;
  status: string;
  isActive: boolean;
};

export default function TuitionCard({ tuition }: { tuition: Tuition }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <Image
          src={tuition.image}
          alt={tuition.title}
          width={120}
          height={120}
          className="h-48 w-full object-cover"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${
            tuition.mode === "Online" ? "bg-emerald-600" : "bg-amber-500"
          }`}
        >
          {tuition.mode}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          {tuition.subject}
        </span>
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-slate-900">
          {tuition.title}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Class Level: {tuition.classLevel}
        </p>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              {tuition.tutor.charAt(0)}
            </span>
            {tuition.tutor}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            {tuition.location}
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {tuition.days} days / week
          </p>
        </div>

        <div className="mt-auto">
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
            <p>
              <span className="text-xl font-extrabold text-emerald-600">
                ৳{tuition.fee.toLocaleString()}
              </span>
              <span className="text-sm text-slate-600"> /month</span>
            </p>
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
