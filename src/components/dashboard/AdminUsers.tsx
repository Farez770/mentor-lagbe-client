"use client";

import { useEffect, useState } from "react";
import { toast } from "@heroui/react";
import { Users } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/Loading";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { adminSections, demoAdmin } from "@/components/dashboard/adminData";
import { authClient } from "@/lib/auth-client";
import {
  getAllUsers,
  updateUserRole,
  type AdminUser,
} from "@/lib/api/admin";


const roleStyles: Record<string, string> = {
  student: "bg-emerald-100 text-emerald-700",
  tutor: "bg-teal-100 text-teal-700",
  admin: "bg-purple-100 text-purple-700",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const joinedOn = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "unknown";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const myId = session?.user?.id;

  useEffect(() => {
    let alive = true;

    getAllUsers()
      .then((data) => {
        if (!alive) return;
        setUsers(data.users);
        setLoadError(false);
      })
      .catch((err) => {
        console.warn("Could not load users:", err);
        if (!alive) return;
        setLoadError(true);
        setUsers([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const onRoleChange = async (user: AdminUser, newRole: AdminUser["role"]) => {
    if (newRole === user.role) return;

    setBusyId(user.id);
    try {
      const result = await updateUserRole(user.id, newRole);
      setUsers((list) =>
        (list ?? []).map((u) => (u.id === user.id ? result.user : u)),
      );
      toast.success(result.message);
    } catch (err) {
      toast.warning(
        err instanceof Error ? err.message : "Could not update the role",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="bg-slate-50 pb-6">
      <DashboardDrawer
        title="Admin Dashboard"
        sections={adminSections}
        user={{ name: demoAdmin.name, role: "Admin", plan: demoAdmin.plan }}
      >
        <div className="mx-auto mt-12 max-w-5xl px-4">
          <div className="mb-5">
            <p className="text-xs font-bold tracking-widest text-emerald-700">
              USER MANAGEMENT
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
              Manage Users
            </h1>
            <p className="mt-1.5 text-sm text-gray-600">
              Every registered account on MentorLagbe — change anyone&apos;s
              role between student, tutor and admin.
            </p>
            {users !== null && !loadError && (
              <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                {users.length} {users.length === 1 ? "user" : "users"}
              </p>
            )}
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                Could not load users
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
                This page is for admin accounts only. Check that you&apos;re
                signed in as an admin and that the API server is running, then
                try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 cursor-pointer rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : users === null ? (
            <LoadingSpinner label="Loading users…" />
          ) : users.length === 0 ? (
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
            <ul className="space-y-4">
              {users.map((user) => {
                const isMe = String(user.id) === String(myId);

                return (
                  <li
                    key={user.id}
                    className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-emerald-950/5 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        )}

                        <div className="min-w-0">
                          <h2 className="truncate font-bold text-[#173D32]">
                            {user.name || "(no name)"}
                            {isMe && (
                              <span className="ml-2 text-xs font-semibold text-emerald-600">
                                (you)
                              </span>
                            )}
                          </h2>
                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined {joinedOn(user.createdAt)} · Plan{" "}
                            {user.plan === "pro" ? "Pro" : "Free"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            roleStyles[user.role] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {capitalize(user.role)}
                        </span>

                        <select
                          value={user.role} // current role (controlled)
                          disabled={busyId === user.id || isMe} // busy OR yourself
                          title={
                            isMe
                              ? "You cannot change your own role"
                              : `Change ${user.name || user.email}'s role`
                          }
                          onChange={(e) =>
                            onRoleChange(
                              user,
                              e.target.value as AdminUser["role"],
                            )
                          }
                          className="cursor-pointer rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 outline-none transition-colors hover:border-emerald-400 focus:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="admin">Admin</option>
                        </select>

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
