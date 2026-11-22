"use client";

import { useEffect, useState } from "react";
import { toast } from "@heroui/react";
import { Camera, Loader2, Save, UserCog } from "lucide-react";
import DashboardDrawer, {
  type DashboardSection,
} from "@/components/dashboard/DashboardDrawer";
import { demoTutor, tutorSections } from "@/components/dashboard/tutorData";
import { studentSections } from "@/components/dashboard/studentData";
import { adminSections } from "@/components/dashboard/adminData";
import { authClient } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";
import { updateProfile, type ProfileForm } from "@/lib/api/profile";


const basicSections: DashboardSection[] = [
  { name: "Update Profile", href: "/dashboard/profile", icon: UserCog },
];

const inputClass =
  "h-10 w-full rounded-lg border border-emerald-300 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export default function UpdateProfile() {
  const { data: session, refetch } = authClient.useSession();

  const [form, setForm] = useState<ProfileForm | null>(null);

  const [newFile, setNewFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const current: ProfileForm = form ?? {
    name: session?.user?.name ?? "",
    phone: session?.user?.phone ?? "",
    bio: session?.user?.bio ?? "",
    image: session?.user?.image || "",
  };

  const update = (key: keyof ProfileForm, value: string) =>
    setForm({ ...current, [key]: value });

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setFilePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const onSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (current.name.trim().length < 2) {
      toast.warning("Name must be at least 2 characters");
      return;
    }
    if (current.bio.length > 500) {
      toast.warning("Bio must be 500 characters or fewer");
      return;
    }
    if (current.image && !current.image.startsWith("http")) {
      toast.warning("Image must be a URL starting with http");
      return;
    }

    setIsSaving(true);
    try {
      let image = current.image.trim();
      if (newFile) {
        image = await uploadToImgBB(newFile);
      }

      const result = await updateProfile({
        name: current.name.trim(),
        phone: current.phone.trim(),
        bio: current.bio.trim(),
        image,
      });

      setForm({
        name: result.profile.name,
        phone: result.profile.phone,
        bio: result.profile.bio,
        image: result.profile.image,
      });
      setNewFile(null);

      toast.success(result.message || "Profile updated");

      await refetch();
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not update profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const role = session?.user?.role as string | undefined;
  const sections =
    role === "tutor"
      ? tutorSections
      : role === "student"
        ? studentSections
        : role === "admin"
          ? adminSections
          : basicSections;

  const shownImage = filePreview || current.image;

  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="My Profile"
        sections={sections}
        user={{ name: demoTutor.name, role: "Tutor", plan: demoTutor.plan }}
      >
        <div className="mx-auto mt-12 max-w-2xl px-4">
          <div className="mb-5">
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              MY PROFILE
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Update Profile
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Your name, contact details and photo — shown to students who view
              your tuitions and to tutors you apply to.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-emerald-950/5 sm:p-7">
            <div className="flex flex-wrap items-center gap-4">
              {shownImage ? (
                <img
                  src={shownImage}
                  alt="Profile picture preview"
                  className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-emerald-100"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-extrabold text-emerald-700">
                  {(current.name || "?").charAt(0)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50">
                  <Camera size={14} />
                  Choose picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={current.image}
                  onChange={(e) => update("image", e.target.value)}
                  placeholder="…or paste an image URL (https://…)"
                  className={inputClass + " mt-2"}
                />
                <p className="mt-1 text-xs text-slate-400">
                  JPG or PNG — uploaded to ImgBB, or paste any direct image URL.
                  Clear the box to remove your picture.
                </p>
              </div>
            </div>

            <form onSubmit={onSave} className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-800">
                  Name *
                </span>
                <input
                  value={current.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-800">
                  Email
                </span>
                <input
                  value={session?.user?.email ?? ""}
                  disabled
                  className={
                    inputClass +
                    " cursor-not-allowed bg-slate-50 text-slate-500"
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-800">
                  Phone
                </span>
                <input
                  value={current.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="e.g. 017XXXXXXXX"
                  className={inputClass}
                />
              </label>

              <div>
                <span className="text-sm font-semibold text-gray-800">
                  Account
                </span>
                <div className="flex h-10 items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    {session?.user?.role ?? "..."}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {session?.user?.plan ?? "free"} plan
                  </span>
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="flex items-center justify-between text-sm font-semibold text-gray-800">
                  Bio
                  <span
                    className={
                      current.bio.length > 500
                        ? "text-rose-600"
                        : "text-slate-400"
                    }
                  >
                    {current.bio.length}/500
                  </span>
                </span>
                <textarea
                  rows={4}
                  value={current.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="A short introduction — subjects you teach or study, experience, usual schedule…"
                  className={inputClass + " h-auto py-2"}
                />
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardDrawer>
    </section>
  );
}
