"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { authLogout } from "@/features/auth/states/reducer";
import { showConfirmDialog } from "@/helpers/toolsHelper";

export default function NavbarComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const profile = useAppSelector(
    (state) => state.users.profile
  );

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const displayName =
    profile?.name || user?.name || "Pengguna";

  const displayEmail =
    profile?.email || user?.email || "";

  const photo = profile?.photo || null;

  const initial = displayName
    .charAt(0)
    .toUpperCase();

  const handleLogout = async () => {
    const confirmed = await showConfirmDialog(
      "Keluar dari akun?",
      "Kamu akan diarahkan kembali ke halaman login."
    );

    if (!confirmed) {
      return;
    }

    await dispatch(authLogout());

    router.replace("/auth/login");
  };

  const isProfileActive =
    pathname === "/profile";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Delcom
            <span className="text-yellow-700">
              Posts
            </span>
          </Link>
        </div>

        <div
          ref={dropdownRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setOpen((value) => !value)
            }
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-yellow-400 font-bold text-slate-900">
              {photo ? (
                <img
                  src={photo}
                  alt={`Foto profil ${displayName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="max-w-40 truncate text-xs text-slate-500">
                {displayEmail}
              </p>
            </div>

            <svg
              className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
              role="menu"
            >
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {displayEmail}
                </p>
              </div>

              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isProfileActive
                    ? "bg-yellow-50 text-yellow-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                role="menuitem"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  👤
                </span>

                Profil Saya
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                role="menuitem"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  ↪
                </span>

                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}