"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  {
    label: "All Posts",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "My Posts",
    href: "/dashboard?is_me=1",
    icon: "▣",
  },
  {
    label: "Users",
    href: "/users",
    icon: "♙",
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: "●",
  },
];

export default function SidebarComponent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: MenuItem) => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === item.href;
  };

  return (
    <>
      {/* Tombol menu mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-xl font-bold text-slate-900 shadow-lg lg:hidden"
        aria-label="Buka menu"
      >
        ☰
      </button>

      {/* Overlay mobile */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Tutup menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white pt-16 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-yellow-400 text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${
                        active
                          ? "bg-white/70"
                          : "bg-slate-100"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-2xl bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Delcom Posts
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Bagikan postingan dan temukan cerita dari pengguna
                lainnya.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}