"use client";

import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  title = "Selamat Datang",
  description = "Masuk atau daftar untuk melanjutkan ke Delcom Posts.",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Banner */}
        <section className="relative hidden overflow-hidden bg-yellow-400 lg:flex">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300" />
          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-yellow-500" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">
            <Link
              href="/"
              className="text-xl font-bold text-slate-900"
            >
              Delcom Posts
            </Link>

            <div className="max-w-lg">
              <div className="mb-6 inline-flex rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                Platform Postingan
              </div>

              <p className="text-5xl font-bold leading-tight tracking-tight text-slate-900">
                Bagikan cerita,
                <br />
                temukan inspirasi.
              </p>

              <p className="mt-6 max-w-md text-lg leading-8 text-slate-700">
                Buat akun dan nikmati pengalaman berbagi postingan
                dengan tampilan yang sederhana dan nyaman.
              </p>
            </div>

            <p className="text-sm text-slate-700">
              © {new Date().getFullYear()} Delcom Posts
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="text-xl font-bold text-slate-900"
              >
                Delcom Posts
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </div>
  );
}