"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthLayout from "@/features/auth/layouts/AuthLayout";
import { useInput } from "@/hooks/useInput";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { authRegister } from "@/features/auth/states/reducer";
import {
  showErrorDialog,
  showSuccessDialog,
} from "@/helpers/toolsHelper";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const name = useInput("");
  const email = useInput("");
  const password = useInput("");
  const confirmPassword = useInput("");

  const { isAuthRegister, error } = useAppSelector(
    (state) => state.auth
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.value.trim()) {
      await showErrorDialog(
        "Nama belum diisi",
        "Silakan masukkan nama lengkap kamu."
      );

      return;
    }

    if (!email.value.trim()) {
      await showErrorDialog(
        "Email belum diisi",
        "Silakan masukkan email kamu."
      );

      return;
    }

    if (!password.value) {
      await showErrorDialog(
        "Password belum diisi",
        "Silakan masukkan password kamu."
      );

      return;
    }

    if (password.value.length < 6) {
      await showErrorDialog(
        "Password terlalu pendek",
        "Password minimal terdiri dari 6 karakter."
      );

      return;
    }

    if (password.value !== confirmPassword.value) {
      await showErrorDialog(
        "Password tidak sama",
        "Pastikan konfirmasi password sama dengan password."
      );

      return;
    }

    const result = await dispatch(
      authRegister({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
      })
    );

    if (authRegister.fulfilled.match(result)) {
      await showSuccessDialog(
        "Registrasi berhasil",
        "Akun berhasil dibuat. Silakan masuk menggunakan akun kamu."
      );

      router.replace("/auth/login");
    } else {
      await showErrorDialog(
        "Registrasi gagal",
        error || "Terjadi kesalahan saat membuat akun."
      );
    }
  };

  return (
    <AuthLayout
      title="Buat akun baru"
      description="Daftarkan akun kamu untuk mulai menggunakan Delcom Posts."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Nama
          </label>

          <input
            id="name"
            type="text"
            placeholder="Nama lengkap"
            value={name.value}
            onChange={name.onChange}
            disabled={isAuthRegister}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={email.value}
            onChange={email.onChange}
            disabled={isAuthRegister}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Minimal 6 karakter"
            value={password.value}
            onChange={password.onChange}
            disabled={isAuthRegister}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Konfirmasi Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Ulangi password"
            value={confirmPassword.value}
            onChange={confirmPassword.onChange}
            disabled={isAuthRegister}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={isAuthRegister}
          className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAuthRegister
            ? "Mendaftarkan..."
            : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-yellow-700 hover:text-yellow-800"
        >
          Masuk sekarang
        </Link>
      </p>
    </AuthLayout>
  );
}