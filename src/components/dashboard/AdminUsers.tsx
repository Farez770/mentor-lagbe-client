"use client";

// "use client" is needed because this page passes icon
// COMPONENTS (functions) to DashboardDrawer, and only client
// components may receive functions as props.
import { useEffect, useState } from "react"; // hooks: load the list, remember the busy row
import { toast } from "@heroui/react"; // success / error messages in the corner
import { Loader2, Users } from "lucide-react"; // spinner + icons
import DashboardDrawer from "@/components/dashboard/DashboardDrawer"; // dashboard shell (sidebar + content area)
import { adminSections, demoAdmin } from "@/components/dashboard/adminData"; // shared admin sidebar
import { authClient } from "@/lib/auth-client"; // to know WHO is logged in (to mark "your" row)
import {
  getAllUsers, // GET /api/admin/users
  updateUserRole, // PATCH /api/admin/users/:id
  type AdminUser, // the shape of one row
} from "@/lib/api/admin";

// ============================================================
// USER MANAGEMENT page (/dashboard/admin/users)
//
// Project requirement:
//   Display all registered users and manage their roles
//   (student / tutor / admin) through protected Express admin
//   endpoints (verifyToken + role === "admin").
//
// Every user comes from GET /api/admin/users — no demo data.
// ============================================================

// Role badge colors (one color family per role — plain class
// names so Tailwind can see them in the source code)
const roleStyles: Record<string, string> = {
  student: "bg-emerald-100 text-emerald-700", // green for students
  tutor: "bg-teal-100 text-teal-700", // teal for tutors
  admin: "bg-purple-100 text-purple-700", // purple for admins
};

// "student" -> "Student" (badge text)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Friendly join date, e.g. "19 Nov 2026" (same as other pages)
const joinedOn = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "unknown";

export default function AdminUsers() {
  // null = still loading the list from the API
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  // true = the last request failed (API down or not an admin)
  const [loadError, setLoadError] = useState(false);
  // id of the user whose role request is running (disables that row)
  const [busyId, setBusyId] = useState<string | null>(null);

  // The logged-in admin — used to spot and lock YOUR OWN row
  // (the server also blocks self-changes, this just avoids
  // clicking something that would fail anyway)
  const { data: session } = authClient.useSession();
  const myId = session?.user?.id; // your own account id

  // ---------- load every user once when the page opens ----------
  useEffect(() => {
    // "alive" = ignore the answer if the page was left first
    let alive = true;

    getAllUsers() // GET /api/admin/users
      .then((data) => {
        if (!alive) return; // page already left — do nothing
        setUsers(data.users); // store the real list
        setLoadError(false); // no error this time
      })
      .catch((err) => {
        console.warn("Could not load users:", err); // log for debugging
        if (!alive) return; // page already left — do nothing
        setLoadError(true); // show the error card below
        setUsers([]); // empty list so the UI stops spinning
      });

    // cleanup: never set state after unmount
    return () => {
      alive = false;
    };
  }, []); // [] = run exactly once

  // ------------------------------------------------------------
  // Change ONE user's role (called by the dropdown's onChange).
  // The <select> is CONTROLLED (value={user.role}), so if the
  // request fails we simply do NOT update the list and the
  // dropdown snaps back to the old role by itself.
  // ------------------------------------------------------------
  const onRoleChange = async (user: AdminUser, newRole: AdminUser["role"]) => {
    if (newRole === user.role) return; // nothing actually changed

    setBusyId(user.id); // disable this row's dropdown
    try {
      // PATCH /api/admin/users/:id with { role }
      const result = await updateUserRole(user.id, newRole);
      // swap the updated row inside the list (server is truth)
      setUsers((list) =>
        (list ?? []).map((u) => (u.id === user.id ? result.user : u)),
      );
      toast.success(result.message); // "X is now tutor"
    } catch (err) {
      // 403 (not admin), 400 (self-change / bad role), network...
      toast.warning(
        err instanceof Error ? err.message : "Could not update the role",
      );
    } finally {
      setBusyId(null); // re-enable the dropdown
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className="bg-slate-50 pb-6">
      {/* ====================================================
          DashboardDrawer = the dashboard SHELL (fixed sidebar
          + the only scrollable area). Navbar/Footer are hidden
          on /dashboard/* routes, so the shell fills the screen.
          ==================================================== */}
      <DashboardDrawer
        title="Admin Dashboard" // small subtitle under the logo
        sections={adminSections} // Overview · User Management · Update Profile · Home
        // Fallback user while the session loads — the drawer
        // swaps in the REAL logged-in admin automatically.
        user={{ name: demoAdmin.name, role: "Admin", plan: demoAdmin.plan }}
      >
        <div className="mx-auto mt-16 max-w-5xl px-4">
          {/* ---------- Page heading ---------- */}
          <div className="mb-5">
            {/* tiny eyebrow label above the title */}
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              USER MANAGEMENT
            </p>
            {/* the page's main heading */}
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Manage Users
            </h1>
            {/* one-line explanation of what this page does */}
            <p className="mt-1.5 text-sm text-gray-600">
              Every registered account on MentorLagbe — change anyone&apos;s
              role between student, tutor and admin.
            </p>
            {/* count pill (only once the list has loaded) */}
            {users !== null && !loadError && (
              <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                {users.length} {users.length === 1 ? "user" : "users"}
              </p>
            )}
          </div>

          {/* ==================================================
              1) ERROR — API not reachable or not an admin
              ================================================== */}
          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              {/* icon for the empty-looking card */}
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              {/* error title */}
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load users
              </h2>
              {/* friendly explanation + how to fix it */}
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                This page is for admin accounts only. Check that you&apos;re
                signed in as an admin and that the API server is running, then
                try again.
              </p>
              {/* retry button — a full reload re-runs the fetch */}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : users === null ? (
            /* ---------- 2) LOADING — request still running ---------- */
            <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
              {/* spinning loader */}
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              {/* loader caption */}
              <p className="text-sm font-medium">Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            /* ---------- 3) EMPTY — no accounts at all (unlikely) ---------- */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                No users found
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                Nobody has registered yet — accounts appear here as soon as
                someone signs up.
              </p>
            </div>
          ) : (
            /* ---------- 4) THE LIST — one card per user ---------- */
            <ul className="space-y-4">
              {users.map((user) => {
                // is THIS row the account you are signed in as?
                const isMe = String(user.id) === String(myId);

                return (
                  <li
                    key={user.id} // stable React key = the user id
                    className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5"
                  >
                    {/* top row: avatar + name/email/date, role controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* ---- left: avatar + identity ---- */}
                      <div className="flex min-w-0 items-center gap-3">
                        {/* avatar: the photo, or the first letter */}
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- user photos can come from any domain
                          <img
                            src={user.image} // the stored image url
                            alt={user.name} // accessible name
                            className="h-11 w-11 shrink-0 rounded-full object-cover" // circle crop
                          />
                        ) : (
                          // letter fallback when the user has no photo
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        )}

                        {/* name + email + join date */}
                        <div className="min-w-0">
                          {/* the user's name (truncates if very long) */}
                          <h2 className="truncate font-bold text-[#173D32]">
                            {user.name || "(no name)"}
                            {/* marker when this row is YOU */}
                            {isMe && (
                              <span className="ml-2 text-xs font-semibold text-emerald-600">
                                (you)
                              </span>
                            )}
                          </h2>
                          {/* the email address (truncates) */}
                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                          {/* join date + plan in one small line */}
                          <p className="text-xs text-gray-400">
                            Joined {joinedOn(user.createdAt)} · Plan{" "}
                            {/* capitalize the plan ("free" -> "Free") */}
                            {user.plan === "pro" ? "Pro" : "Free"}
                          </p>
                        </div>
                      </div>

                      {/* ---- right: role badge + role dropdown ---- */}
                      <div className="flex items-center gap-3">
                        {/* colored badge showing the CURRENT role */}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            roleStyles[user.role] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {capitalize(user.role)}
                        </span>

                        {/* ============ ROLE DROPDOWN ============
                            The heart of this page: choosing a
                            option immediately calls
                            PATCH /api/admin/users/:id.
                            - controlled: value always shows the
                              current role from the server
                            - disabled while saving or when the
                              row is your own account
                            ====================================== */}
                        <select
                          value={user.role} // current role (controlled)
                          disabled={busyId === user.id || isMe} // busy OR yourself
                          title={
                            isMe
                              ? "You cannot change your own role"
                              : `Change ${user.name || user.email}'s role`
                          }
                          onChange={(e) =>
                            // read the picked value and send it
                            onRoleChange(
                              user,
                              e.target.value as AdminUser["role"],
                            )
                          }
                          className="cursor-pointer rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 outline-none transition-colors hover:border-emerald-400 focus:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {/* the three allowed roles */}
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* small "saving..." hint while the request runs */}
                        {busyId === user.id && (
                          <span className="text-xs text-slate-400">
                            Saving…
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DashboardDrawer>
    </section>
  );
}
