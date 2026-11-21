"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Description,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { ImagePlus, Send } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { demoTutor, tutorSections } from "@/components/dashboard/tutorData";
import { createTuition, getMyTuitions } from "@/lib/api/tuitions";

// ============================================================
// POST A TUITION page (/dashboard/tutor/post-tuition)
//
// What it does (real functionality, no demo data):
//   1. shows your REAL plan (free/pro) and how many of the
//      2 free tuition posts you already used
//   2. validates the form before sending anything
//   3. uploads the banner image to ImgBB (same as sign-up)
//   4. saves the tuition through our Express API
//      (POST /api/tuitions) — saved with approvalStatus "pending"
//   5. blocks free tutors after 2 posts (server checks it too)
// ============================================================

// The empty form — also used to reset after a successful post
const emptyForm = {
  title: "",
  subject: "",
  classLevel: "Class 9-10", // default so a select always has a value
  mode: "Online", // "Online" | "Offline"
  location: "",
  fee: "", // monthly fee (kept as text while typing)
  days: "3", // days per week
  description: "",
};

export default function PostTuition() {
  // All form values in ONE state object (easy to reset)
  const [form, setForm] = useState(emptyForm);

  // The chosen banner file + its local preview URL
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Disables the button while uploading/saving
  const [isPending, setIsPending] = useState(false);

  // REAL data from the API — null = still loading
  const [plan, setPlan] = useState<string | null>(null);
  const [myCount, setMyCount] = useState<number | null>(null);

  // Small helper to update a single field
  const update = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ------------------------------------------------------------
  // On mount: load the real plan (BetterAuth session) and how
  // many tuitions this tutor already posted (our API).
  // ------------------------------------------------------------
  useEffect(() => {
    let active = true; // ignore updates after unmount

    (async () => {
      // 1) plan from the session (cannot be faked)
      const { data } = await authClient.getSession();
      if (active && data?.user) {
        setPlan(String(data.user.plan ?? "free"));
      }

      // 2) my tuitions count (GET /api/tuitions/mine)
      try {
        const res = await getMyTuitions();
        if (active) setMyCount(res.tuitions.length);
      } catch {
        // API not running — don't block the form, server
        // will still enforce the limit when submitting
        if (active) setMyCount(0);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Free the local preview URL when it changes / page unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ------------------------------------------------------------
  // Plan rules (from the project requirement):
  //   Free plan  → max 2 tuition posts
  //   Pro plan   → unlimited posts
  // ------------------------------------------------------------
  const isPro = (plan ?? "").toLowerCase() === "pro";
  const used = myCount ?? 0;
  const limitReached = plan !== null && !isPro && used >= 2;

  // ------------------------------------------------------------
  // When the user picks a banner file → keep it + show preview
  // ------------------------------------------------------------
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setPreview(URL.createObjectURL(file)); // local blob preview
  };

  // ------------------------------------------------------------
  // Submit: validate → upload image → save via API → reset
  // ------------------------------------------------------------
  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ---------- 1) validate everything first ----------
    const errors: string[] = [];

    if (form.title.trim().length < 5) {
      errors.push("Title must be at least 5 characters");
    }
    if (!form.subject.trim()) {
      errors.push("Subject is required");
    }
    if (!form.classLevel) {
      errors.push("Please choose a class level");
    }
    if (form.mode !== "Online" && form.mode !== "Offline") {
      errors.push("Please choose Teaching Mode (Online or Offline)");
    }
    if (form.mode === "Offline" && !form.location.trim()) {
      errors.push("Location is required for offline tuitions");
    }
    const fee = Number(form.fee);
    if (form.fee.trim() === "" || Number.isNaN(fee) || fee < 0) {
      errors.push("Enter a valid monthly fee");
    }
    const days = Number(form.days);
    if (days < 1 || days > 7) {
      errors.push("Days per week must be between 1 and 7");
    }
    if (form.description.trim().length < 20) {
      errors.push("Description must be at least 20 characters");
    }
    if (!bannerFile) {
      errors.push("Please select a banner image");
    }

    if (errors.length > 0) {
      toast.warning(errors[0]); // show the first problem
      return;
    }

    setIsPending(true);

    try {
      // ---------- 2) upload the banner to ImgBB ----------
      // (same API the sign-up page uses)
      const imageData = new FormData();
      imageData.append("image", bannerFile as File);

      const uploadRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        { method: "POST", body: imageData },
      );
      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok || !uploadJson.success) {
        throw new Error("Banner upload failed. Please try again");
      }

      // ---------- 3) save the tuition through OUR API ----------
      // ★ JWT: the signed token is attached inside apiFetch, and the
      // server checks the role + free-plan limit.
      const result = await createTuition({
        title: form.title.trim(),
        subject: form.subject.trim(),
        classLevel: form.classLevel,
        mode: form.mode as "Online" | "Offline",
        location: form.location.trim() || "Online",
        fee,
        days,
        description: form.description.trim(),
        image: uploadJson.data.url, // ImgBB URL saved in MongoDB
      });

      toast.success(result.message || "Tuition posted!");

      // ---------- 4) reset for the next tuition ----------
      setForm(emptyForm);
      setBannerFile(null);
      setPreview(null);
      setMyCount((count) => (count ?? 0) + 1); // "X of 2" grows
    } catch (err) {
      // Shows the SERVER's message, e.g.
      // "Free plan allows up to 2 tuitions. Upgrade to Pro..."
      toast.warning(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setIsPending(false);
    }
  };

  // Same input styles as the sign-in / sign-up pages
  const inputClass =
    "h-10 w-full rounded-lg border border-emerald-300 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    // The dashboard shell (sidebar) + this page's content
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Tutor Dashboard"
        sections={tutorSections}
        // Fallback user shown for a moment while the session
        // loads — the drawer swaps in the REAL logged-in user
        // (name, role, plan, photo) automatically.
        user={{ name: demoTutor.name, role: "Tutor", plan: demoTutor.plan }}
      >
        <div className="mx-auto mt-16 max-w-4xl px-4">
          {/* ====================================================
              The white card that contains the whole form
              ==================================================== */}
          <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-emerald-950/5 sm:p-7">
            {/* ---------- Page heading ---------- */}
            <div className="mb-4">
              <p className="text-xs font-bold tracking-widest text-emerald-700">
                POST A TUITION
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
                Create a new tuition listing
              </h1>
              <p className="mt-1.5 text-sm text-gray-600">
                Fill in the details below. Your tuition becomes visible to
                students after an admin approves it.
              </p>
            </div>

            {/* ====================================================
                PLAN BANNER — real plan + real post counter.
                Shows the Free plan rule (max 2 posts) right on
                the form, and blocks the button when it is full.
                ==================================================== */}
            {plan === null ? (
              <p className="mb-4 text-sm text-gray-500">
                Checking your plan...
              </p>
            ) : isPro ? (
              <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                ⭐ Pro plan — you can post unlimited tuitions
              </div>
            ) : (
              <div
                className={
                  limitReached
                    ? "mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-300"
                    : "mb-4 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                }
              >
                📝 Free plan — you&apos;ve used {used} of 2 tuition posts
                {limitReached
                  ? ". Upgrade to Pro to post more!"
                  : ". You can post " + (2 - used) + " more."}
              </div>
            )}

            {/* ====================================================
                THE FORM
                ==================================================== */}
            <Form className="w-full" onSubmit={onSubmit}>
              <Fieldset className="w-full">
                <Fieldset.Legend className="sr-only">
                  Post a new tuition
                </Fieldset.Legend>

                {/* 2-column grid — the inline style guarantees the
                    tight spacing (inline styles always win over a
                    component's own default gap) */}
                <FieldGroup
                  className="grid gap-3 md:grid-cols-2"
                  style={{ gap: "10px" }}
                >
                  {/* ---------- Title ---------- */}
                  <TextField className="md:col-span-2" isRequired name="title">
                    <Label className="text-sm font-semibold text-gray-800">
                      Tuition Title
                    </Label>
                    <Input
                      name="title"
                      placeholder="e.g. Class 9-10 Physics Crash Batch"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      className={inputClass}
                    />
                    <FieldError />
                  </TextField>

                  {/* ---------- Subject ---------- */}
                  <TextField isRequired name="subject">
                    <Label className="text-sm font-semibold text-gray-800">
                      Subject
                    </Label>
                    <Input
                      name="subject"
                      placeholder="e.g. Physics"
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className={inputClass}
                    />
                    <FieldError />
                  </TextField>

                  {/* ---------- Class Level (dropdown) ---------- */}
                  <TextField isRequired name="classLevel">
                    <Label className="text-sm font-semibold text-gray-800">
                      Class Level
                    </Label>
                    <Select
                      selectedKey={form.classLevel}
                      onSelectionChange={(key) =>
                        key != null && update("classLevel", String(key))
                      }
                    >
                      <Select.Trigger className={inputClass + " text-left"}>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        {/* NOTE: React Aria matches selectedKey against the
                            item's id (NOT the React key) — that is why the
                            Days per Week dropdown worked but these two showed
                            "Select an item". Every item needs an id. */}
                        <ListBox>
                          <ListBox.Item key="Class 1-5" id="Class 1-5">
                            Class 1-5
                          </ListBox.Item>
                          <ListBox.Item key="Class 6-7" id="Class 6-7">
                            Class 6-7
                          </ListBox.Item>
                          <ListBox.Item key="Class 8" id="Class 8">
                            Class 8
                          </ListBox.Item>
                          <ListBox.Item key="Class 9-10" id="Class 9-10">
                            Class 9-10
                          </ListBox.Item>
                          <ListBox.Item key="Class 11-12" id="Class 11-12">
                            Class 11-12
                          </ListBox.Item>
                          <ListBox.Item key="Admission" id="Admission">
                            Admission Test
                          </ListBox.Item>
                          <ListBox.Item key="Skill" id="Skill">
                            Skill Course
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <FieldError />
                  </TextField>

                  {/* ---------- Mode (Online / Offline) ---------- */}
                  <TextField isRequired name="mode">
                    <Label className="text-sm font-semibold text-gray-800">
                      Teaching Mode
                    </Label>
                    <Select
                      selectedKey={form.mode}
                      onSelectionChange={(key) =>
                        key != null && update("mode", String(key))
                      }
                    >
                      <Select.Trigger className={inputClass + " text-left"}>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        {/* id = the value saved in form.mode (Online/Offline) */}
                        <ListBox>
                          <ListBox.Item key="Online" id="Online">
                            Online
                          </ListBox.Item>
                          <ListBox.Item key="Offline" id="Offline">
                            Offline
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <FieldError />
                  </TextField>

                  {/* ---------- Location (required if Offline) ---------- */}
                  <TextField name="location">
                    <Label className="text-sm font-semibold text-gray-800">
                      Location
                    </Label>
                    <Input
                      name="location"
                      placeholder={
                        form.mode === "Offline"
                          ? "e.g. Dhanmondi, Dhaka"
                          : "e.g. Online (Zoom) — optional"
                      }
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                      className={inputClass}
                    />
                    <FieldError />
                  </TextField>

                  {/* ---------- Monthly Fee ---------- */}
                  <TextField isRequired name="fee" type="number">
                    <Label className="text-sm font-semibold text-gray-800">
                      Monthly Fee (৳)
                    </Label>
                    <Input
                      name="fee"
                      type="number"
                      min={0}
                      placeholder="e.g. 2500"
                      value={form.fee}
                      onChange={(e) => update("fee", e.target.value)}
                      className={inputClass}
                    />
                    <FieldError />
                  </TextField>

                  {/* ---------- Days per Week (dropdown) ---------- */}
                  <TextField isRequired name="days">
                    <Label className="text-sm font-semibold text-gray-800">
                      Days per Week
                    </Label>
                    <Select
                      selectedKey={form.days}
                      onSelectionChange={(key) =>
                        key != null && update("days", String(key))
                      }
                    >
                      <Select.Trigger className={inputClass + " text-left"}>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {["1", "2", "3", "4", "5", "6", "7"].map((d) => (
                            <ListBox.Item key={d} id={d}>
                              {d} {d === "1" ? "day" : "days"}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <FieldError />
                  </TextField>

                  {/* ---------- Description ---------- */}
                  <TextField
                    className="md:col-span-2"
                    isRequired
                    name="description"
                  >
                    <Label className="text-sm font-semibold text-gray-800">
                      Description
                    </Label>
                    <TextArea
                      rows={4}
                      name="description"
                      placeholder="What will you teach, your schedule, who should join, your teaching style..."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                    <Description className="text-xs text-gray-600">
                      Minimum 20 characters.
                    </Description>
                    <FieldError />
                  </TextField>

                  {/* ==================================================
                      BANNER IMAGE — click to upload, live preview.
                      The file goes to ImgBB on submit; only the
                      URL is saved in MongoDB.
                      ================================================== */}
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-800">
                      Banner Image{" "}
                      <span className="text-rose-500" aria-hidden="true">
                        *
                      </span>
                    </span>

                    <label
                      htmlFor="banner"
                      className="mt-1.5 flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50"
                    >
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote image
                        <img
                          src={preview}
                          alt="Banner preview"
                          className="h-20 w-32 rounded-md object-cover ring-1 ring-emerald-200"
                        />
                      ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <ImagePlus size={22} />
                        </span>
                      )}
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold text-emerald-700">
                          Click to upload
                        </span>{" "}
                        a banner image
                        <br />
                        JPG or PNG — a wide 16:9 image works best
                      </span>
                    </label>

                    {/* The real file input — `hidden` keeps it invisible.
                        The label above is the visible button.
                        (display:none inputs cannot take focus, so the page
                        never jump-scrolls when the file dialog opens.) */}
                    <input
                      id="banner"
                      name="banner"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                  </div>
                </FieldGroup>

                {/* ---------- Submit ---------- */}
                <Fieldset.Actions className="mt-4 w-full">
                  <Button
                    type="submit"
                    isDisabled={isPending || limitReached}
                    className="h-12 w-full gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                    {isPending ? "Posting..." : "Post Tuition"}
                  </Button>
                </Fieldset.Actions>
              </Fieldset>
            </Form>
          </div>
        </div>
      </DashboardDrawer>
    </section>
  );
}
