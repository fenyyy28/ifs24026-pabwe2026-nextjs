"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthLayout from "@/features/auth/layouts/AuthLayout";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { authLogin } from "@/features/auth/states/reducer";
import {
  showErrorDialog,
  showSuccessDialog,
} from "@/helpers/toolsHelper";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthLogin } = useAppSelector(
    (state) => state.auth
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      await showErrorDialog(
        "Email belum diisi",
        "Silakan masukkan email kamu."
      );
      return;
    }

    if (!password.trim()) {
      await showErrorDialog(
        "Password belum diisi",
        "Silakan masukkan password kamu."
      );
      return;
    }

    const result = await dispatch(
      authLogin({
        email: email.trim(),
        password,
      })
    );

    if (authLogin.fulfilled.match(result)) {
      await showSuccessDialog(
        "Login berhasil",
        "Selamat datang kembali!"
      );

      router.replace("/dashboard");
      return;
    }

    const errorMessage =
      typeof result.payload === "string"
        ? result.payload
        : "Email atau password tidak sesuai.";

    await showErrorDialog(
      "Login gagal",
      errorMessage
    );
  };

  return (
    <AuthLayout
      title="Masuk ke akun"
      description="Masukkan email dan password untuk melanjutkan."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Masukkan email kamu"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Masukkan password kamu"
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <button
          type="submit"
          disabled={isAuthLogin}
          className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAuthLogin ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-yellow-600 transition hover:text-yellow-700"
          >
            Daftar sekarang
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}