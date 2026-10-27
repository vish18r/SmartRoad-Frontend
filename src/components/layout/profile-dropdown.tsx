"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, Trash2, UserRound } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { authApi } from "@/lib/api/auth-api";
import type { User } from "@/types/auth";
import type { ApiError } from "@/types/api";
import type { OrganizationResponse } from "@/types/organization";

interface ProfileDropdownProps {
  user: User | null;
  organization?: OrganizationResponse | null;
}

export function ProfileDropdown({ user, organization }: ProfileDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletePasswordError, setDeletePasswordError] = useState("");
  const [deleteNotice, setDeleteNotice] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setConfirmingDelete(false);
      setDeletePassword("");
      setDeletePasswordError("");
      setDeleteNotice("");
    }
  }, [open]);

  const name = user ? `${user.firstName} ${user.lastName || ""}`.trim() : "User";
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U" : "U";

  const logout = async () => {
    setSigningOut(true);
    try {
      await auth.logout();
      router.replace("/login");
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  };

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeletePasswordError("");
    try {
      await authApi.deleteAccount(deletePassword);
    } catch (error) {
      const message = (error as ApiError)?.message || "";
      setDeletePasswordError(
        /incorrect|invalid credentials/i.test(message) || !message ? "Incorrect password." : message,
      );
      setDeletingAccount(false);
      return;
    }
    setDeletingAccount(false);
    setConfirmingDelete(false);
    setDeletePassword("");
    setDeleteNotice("Your account has been deleted. Signing you out...");
    try {
      await auth.logout();
    } finally {
      router.replace("/login");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 focus:outline-none focus-visible:shadow-[var(--focus-ring)]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-bold text-white shadow-[var(--shadow-sm)]">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate font-medium text-slate-700 sm:inline">{name}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-[var(--transition-fast)] motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="animate-dialog-in absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(22rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-b-2xl rounded-t-sm border border-slate-200 bg-white shadow-[var(--shadow-lg)] motion-reduce:animate-none"
        >
          <div className="flex items-start gap-3 px-5 pt-4">
            <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-sm font-bold text-white shadow-[var(--shadow-sm)]">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-blue-900">{name}</p>
              {user?.phoneNumber && (
                <p className="truncate text-xs text-slate-500">
                  {user.countryCode ? `${user.countryCode} ` : ""}
                  {user.phoneNumber}
                </p>
              )}
              {user?.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
            </div>
          </div>

          {organization && (
            <div className="mx-5 mt-3 border-t border-slate-100 pt-3">
              <p className="text-sm font-semibold text-slate-800">{organization.name}</p>
              {organization.address && (
                <p className="mt-0.5 text-xs leading-snug text-slate-500">{organization.address}</p>
              )}
            </div>
          )}

          <div className="mx-5 my-3 border-t border-dashed border-slate-300" />

          <nav className="flex flex-col py-1" aria-label="Account menu">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between gap-4 px-5 py-3.5 text-lg font-medium text-slate-900 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
            >
              View Profile
              <UserRound aria-hidden="true" strokeWidth={1.75} className="h-6 w-6 flex-shrink-0 text-blue-700" />
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between gap-4 px-5 py-3.5 text-lg font-medium text-slate-900 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
            >
              Settings
              <Settings aria-hidden="true" strokeWidth={1.75} className="h-6 w-6 flex-shrink-0 text-blue-700" />
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={signingOut}
              className="flex items-center justify-between gap-4 px-5 py-3.5 text-left text-lg font-medium text-slate-900 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Log out"}
              <LogOut aria-hidden="true" strokeWidth={1.75} className="h-6 w-6 flex-shrink-0 text-blue-700" />
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center justify-between gap-4 px-5 py-3.5 pb-4 text-left text-lg font-medium text-red-600 transition-colors duration-[var(--transition-fast)] hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
            >
              Delete Account
              <Trash2 aria-hidden="true" strokeWidth={1.75} className="h-6 w-6 flex-shrink-0 text-red-600" />
            </button>
          </nav>

          {deleteNotice && (
            <p className="animate-fade-in-up mx-5 mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 motion-reduce:animate-none">
              {deleteNotice}
            </p>
          )}
        </div>
      )}

      {confirmingDelete && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setConfirmingDelete(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(event) => event.stopPropagation()}
            className="animate-dialog-in w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-lg)]"
          >
            <h2 id="delete-account-title" className="text-base font-semibold text-slate-900">
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This permanently removes your access to SMART ROAD, including your profile, attendance history, and
              payroll records. This action cannot be undone.
            </p>

            <label htmlFor="delete-account-password" className="mt-4 block text-xs font-medium text-slate-700">
              Confirm your password to continue
            </label>
            <input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(event) => {
                setDeletePassword(event.target.value);
                setDeletePasswordError("");
              }}
              placeholder="Password"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:border-transparent focus:shadow-[var(--focus-ring)]"
            />
            {deletePasswordError && (
              <p className="animate-fade-in-up mt-1.5 text-xs text-red-600">{deletePasswordError}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                disabled={!deletePassword || deletingAccount}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-[var(--transition-fast)] hover:bg-red-700 disabled:opacity-50"
              >
                {deletingAccount ? "Deleting..." : "Yes, delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
