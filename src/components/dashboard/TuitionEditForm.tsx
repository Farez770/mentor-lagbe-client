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
import { Save, X } from "lucide-react";
import {
  updateTuition,
  type CreateTuitionInput,
  type PostedTuition,
} from "@/lib/api/tuitions";
import { uploadToImgBB } from "@/lib/imgbb";

// ============================================================
// TUITION EDIT FORM (used inside the My Tuitions page)
//
// Same fields as Post a Tuition, but:
//   - the form STARTS with the tuition's current values
//   - the banner image is OPTIONAL (keeps the old one unless
//     you pick a new file)
//   - Save Changes -> PATCH /api/tuitions/:id
//   - Cancel       -> parent switches back to the card view
// ============================================================

// The props the parent (MyTuitions) passes in
type Props = {
  tuition: PostedTuition; // the post being edited
  onSaved: (updated: PostedTuition) => void; // parent updates its list
  onCancel: () => void; // parent hides the form
};

export default function TuitionEditForm({ tuition, onSaved, onCancel }: Props) {
  // ---------- form state: starts with the CURRENT values ----------
  const [form, setForm] = useState({
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location,
    fee: String(tuition.fee), // stored as text while typing
    days: String(tuition.days), // stored as text for the dropdown
    description: tuition.description,
  });

  // a NEW banner file — only set if the tutor picks another image
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  // local preview of that new file (null = show the old banner)
  const [preview, setPreview] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);

  // free the object URL whenever the preview changes / unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // update ONE field of the form
  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // when the tutor picks a new banner file -> keep it + preview
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setPreview(URL.createObjectURL(file)); // local blob preview
  };

  // ------------------------------------------------------------
  // Submit: validate -> (upload only if a new image) -> PATCH
  // ------------------------------------------------------------
  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ---------- 1) validate everything first ----------
    // (the same rules as creating a tuition)
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
    // banner: only required when the tuition somehow has none
    if (!bannerFile && !tuition.image) {
      errors.push("Please select a banner image");
    }

    if (errors.length > 0) {
      toast.warning(errors[0]); // show the first problem
      return;
    }

    setIsPending(true);

    try {
      // ---------- 2) upload a new banner ONLY if one was picked ----------
      // otherwise the old ImgBB URL stays as it is
      const image = bannerFile
        ? await uploadToImgBB(bannerFile)
        : tuition.image;

      // ---------- 3) save through OUR API ----------
      // (★ JWT: the signed token is attached inside apiFetch;
      //  the server checks ownership + the same rules)
      const payload: CreateTuitionInput = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        classLevel: form.classLevel,
        mode: form.mode as "Online" | "Offline",
        location: form.location.trim() || "Online",
        fee,
        days,
        description: form.description.trim(),
        image,
      };

      const result = await updateTuition(tuition.id, payload);

      toast.success(result.message || "Tuition updated!");
      onSaved(result.tuition); // parent swaps the form back to the card
    } catch (err) {
      // Shows the SERVER's message (e.g. validation or 403)
      toast.warning(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setIsPending(false);
    }
  };

  // Same input styles as Post a Tuition
  const inputClass =
    "h-10 w-full rounded-lg border border-emerald-300 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-emerald-950/5 sm:p-7">
      {/* ---------- Small heading ---------- */}
      <div className="mb-4">
        <p className="text-xs font-bold tracking-widest text-emerald-700">
          EDIT TUITION
        </p>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#173D32]">
          {tuition.title}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Change the details below and press Save. The admin approval status
          stays as it is — only the admin changes it.
        </p>
      </div>

      {/* ====================================================
          THE FORM (same structure as Post a Tuition)
          ==================================================== */}
      <Form className="w-full" onSubmit={onSubmit}>
        <Fieldset className="w-full">
          <Fieldset.Legend className="sr-only">Edit tuition</Fieldset.Legend>

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
                      item's id (NOT the React key) — every item needs an id */}
                  <ListBox>
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
                BANNER IMAGE — optional here.
                Shows the CURRENT banner; clicking lets you
                replace it (new file goes to ImgBB on save).
                ================================================== */}
            <div className="md:col-span-2">
              <span className="text-sm font-semibold text-gray-800">
                Banner Image{" "}
                <span className="text-gray-400 text-xs font-normal">
                  (optional — keeps the current image)
                </span>
              </span>

              <label
                htmlFor="edit-banner"
                className="mt-1.5 flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote image
                  <img
                    src={preview}
                    alt="New banner preview"
                    className="h-20 w-32 rounded-md object-cover ring-1 ring-emerald-200"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- DB image, host not known at build time
                  <img
                    src={tuition.image}
                    alt="Current banner"
                    className="h-20 w-32 rounded-md object-cover ring-1 ring-emerald-200"
                  />
                )}
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-emerald-700">
                    {preview ? "New image selected" : "Click to replace"}
                  </span>
                  <br />
                  JPG or PNG — a wide 16:9 image works best
                </span>
              </label>

              {/* The real file input — `hidden` keeps it invisible.
                  The label above is the visible button. */}
              <input
                id="edit-banner"
                name="banner"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </FieldGroup>

          {/* ---------- Save + Cancel ---------- */}
          <div className="mt-4 flex w-full gap-3">
            <Button
              type="submit"
              isDisabled={isPending}
              className="h-12 w-full gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              isDisabled={isPending}
              className="h-12 w-full gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={16} />
              Cancel
            </Button>
          </div>
        </Fieldset>
      </Form>
    </div>
  );
}
