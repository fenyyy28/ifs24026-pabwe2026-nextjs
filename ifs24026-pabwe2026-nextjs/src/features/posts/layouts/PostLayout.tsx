"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAccessToken } from "@/helpers/apiHelper";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchProfile } from "@/features/users/states/reducer";

import NavbarComponent from "@/features/posts/components/NavbarComponent";
import SidebarComponent from "@/features/posts/components/SidebarComponent";

interface PostLayoutProps {
  children: React.ReactNode;
}

export default function PostLayout({
  children,
}: PostLayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] =
    useState(false);

  const {
    profile,
    isProfile,
    error: usersError,
  } = useAppSelector((state) => state.users);

  useEffect(() => {
    setMounted(true);

    const token = getAccessToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setAuthenticated(true);

    if (!profile && !isProfile) {
      dispatch(fetchProfile());
    }
  }, [
    dispatch,
    isProfile,
    profile,
    router,
  ]);

  useEffect(() => {
    if (!mounted || !authenticated) {
      return;
    }

    if (usersError && !profile) {
      router.replace("/auth/login");
    }
  }, [
    mounted,
    authenticated,
    usersError,
    profile,
    router,
  ]);

  if (!mounted) {
    return null;
  }

  if (!authenticated) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" />

          <p className="text-sm font-medium text-slate-600">
            Memuat akun...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarComponent />

      <div className="flex">
        <SidebarComponent />

        <main
          className="min-w-0 flex-1 lg:pl-64"
          aria-label="Konten utama"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}