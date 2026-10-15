"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import type { User } from "@/types/auth";
import type { OrganizationResponse } from "@/types/organization";

interface ProfileDropdownProps {
  user: User | null;
  organization?: OrganizationResponse | null;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-4 w-4 flex-shrink-0 transition-transform duration-[var(--transition-fast)] ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICON_PATHS = {
  profile: "M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 1.5c-3 0-6 1.5-6 4.5v.5h12v-.5c0-3-3-4.5-6-4.5Z",
  settings:
    "M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 10a6.4 6.4 0 0 1 .06-.86l-1.4-1.1 1.4-2.42 1.65.56c.3-.26.63-.48.98-.66l.25-1.72h2.8l.25 1.72c.35.18.68.4.98.66l1.65-.56 1.4 2.42-1.4 1.1c.04.28.06.57.06.86s-.02.58-.06.86l1.4 1.1-1.4 2.42-1.65-.56c-.3.26-.63.48-.98.66l-.25 1.72h-2.8l-.25-1.72a5.4 5.4 0 0 1-.98-.66l-1.65.56-1.4-2.42 1.4-1.1A6.4 6.4 0 0 1 3.5 10Z",
  bell: "M10 2.5c-2 0-3.5 1.6-3.5 3.6v2c0 .7-.3 1.4-.8 1.9l-.7.7c-.5.5-.1 1.3.6 1.3h8.8c.7 0 1.1-.8.6-1.3l-.7-.7a2.7 2.7 0 0 1-.8-1.9v-2c0-2-1.5-3.6-3.5-3.6ZM8.3 15a1.7 1.7 0 0 0 3.4 0",
  logout: "M8 3.5H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 16.5h3M13 13l3.5-3-3.5-3M16 10H7.5",
  trash: "M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M6 6l.6 9a1.5 1.5 0 0 0 1.5 1.4h3.8a1.5 1.5 0 0 0 1.5-1.4l.6-9",
};

export function ProfileDropdown({ user, organization }: ProfileDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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

  const requestDeleteAccount = () => {
    setDeleteNotice(
      "Account deletion isn't self-serve yet — contact support and we'll take care of it for you.",
    );
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
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-dialog-in absolute right-0 top-[calc(100%+0.5rem)] z-40 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-lg)]"
          style={{ fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
        >
          <div className="flex items-start gap-3">
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
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-sm font-semibold text-slate-800">{organization.name}</p>
              {organization.address && (
                <p className="mt-0.5 text-xs leading-snug text-slate-500">{organization.address}</p>
              )}
            </div>
          )}

          <div className="my-3 border-t border-dashed border-slate-200" />

          <nav className="flex flex-col gap-0.5" aria-label="Account menu">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 hover:text-blue-900"
            >
              View profile
              <MenuIcon path={ICON_PATHS.profile} />
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 hover:text-blue-900"
            >
              Account settings
              <MenuIcon path={ICON_PATHS.settings} />
            </Link>
            <Link
              href="/notifications"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 hover:text-blue-900"
            >
              Notifications
              <MenuIcon path={ICON_PATHS.bell} />
            </Link>

            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={signingOut}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 hover:text-blue-900 disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Log out"}
              <MenuIcon path={ICON_PATHS.logout} />
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-medium text-red-600 transition-colors duration-[var(--transition-fast)] hover:bg-red-50"
            >
              Delete account
              <MenuIcon path={ICON_PATHS.trash} />
            </button>
          </nav>

          {deleteNotice && (
            <p className="animate-fade-in-up mt-2 rounded-lg bg-slate-50 px-2 py-2 text-xs text-slate-600">
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
                onClick={() => {
                  setConfirmingDelete(false);
                  requestDeleteAccount();
                }}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-[var(--transition-fast)] hover:bg-red-700"
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
