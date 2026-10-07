"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  {
    label: "All Posts",
    href: "/",
    icon: "⌂",
  },
  {
    label: "My Posts",
    href: "/?is_me=1",
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
  const searchParams = useSearchParams();

  const isMyPosts =
    pathname === "/" && searchParams.get("is_me") === "1";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && !isMyPosts;
    }

    return pathname === href;
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Delcom Posts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Menu utama
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {menuItems.map((item) => {
            const active =
              item.href === "/?is_me=1"
                ? isMyPosts
                : isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-yellow-100 text-yellow-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-400">
            Delcom Posts
          </p>
        </div>
      </div>
    </aside>
  );
}