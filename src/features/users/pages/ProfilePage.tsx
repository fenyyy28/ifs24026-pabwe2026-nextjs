"use client";

import { ChangeEvent, FormEvent, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  changeProfile,
  changeProfilePassword,
  changeProfilePhoto,
  fetchProfile,
} from "@/features/users/states/reducer";
import { useInput } from "@/hooks/useInput";
import {
  showErrorDialog,
  showSuccessDialog,
} from "@/helpers/toolsHelper";

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  const {
    profile,
    isProfile,
    isChangeProfile,
    isChangeProfilePhoto,
    isChangeProfilePassword,
    error,
  } = useAppSelector((state) => state.users);

  const name = useInput("");
  const bio = useInput("");
  const oldPassword = useInput("");
  const newPassword = useInput("");
  const confirmPassword = useInput("");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      name.setValue(profile.name);
      bio.setValue(profile.bio ?? "");
    }
  }, [profile]);

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.value.trim()) {
      await showErrorDialog(
        "Nama belum diisi",
        "Silakan masukkan nama kamu."
      );
      return;
    }

    const result = await dispatch(
      changeProfile({
        name: name.value.trim(),
        bio: bio.value.trim(),
      })
    );

    if (changeProfile.fulfilled.match(result)) {
      await showSuccessDialog(
        "Profil diperbarui",
        "Data profil berhasil diperbarui."
      );
    } else {
      await showErrorDialog(
        "Gagal memperbarui profil",
        (result.payload as string) ||
          error ||
          "Terjadi kesalahan."
      );
    }
  };

  const handlePhotoChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      await showErrorDialog(
        "File tidak valid",
        "Silakan pilih file gambar."
      );
      return;
    }

    const result = await dispatch(
      changeProfilePhoto(file)
    );

    if (changeProfilePhoto.fulfilled.match(result)) {
      await showSuccessDialog(
        "Foto diperbarui",
        "Foto profil berhasil diperbarui."
      );
    } else {
      await showErrorDialog(
        "Gagal memperbarui foto",
        (result.payload as string) ||
          error ||
          "Terjadi kesalahan."
      );
    }

    event.target.value = "";
  };

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!oldPassword.value || !newPassword.value) {
      await showErrorDialog(
        "Password belum lengkap",
        "Password lama dan password baru harus diisi."
      );
      return;
    }

    if (newPassword.value.length < 6) {
      await showErrorDialog(
        "Password terlalu pendek",
        "Password baru minimal 6 karakter."
      );
      return;
    }

    if (
      newPassword.value !==
      confirmPassword.value
    ) {
      await showErrorDialog(
        "Password tidak sama",
        "Konfirmasi password harus sama dengan password baru."
      );
      return;
    }

    const result = await dispatch(
      changeProfilePassword({
        old_password: oldPassword.value,
        new_password: newPassword.value,
      })
    );

    if (
      changeProfilePassword.fulfilled.match(result)
    ) {
      oldPassword.setValue("");
      newPassword.setValue("");
      confirmPassword.setValue("");

      await showSuccessDialog(
        "Password diperbarui",
        "Password berhasil diubah."
      );
    } else {
      await showErrorDialog(
        "Gagal mengubah password",
        (result.payload as string) ||
          error ||
          "Terjadi kesalahan."
      );
    }
  };

  if (isProfile && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <p className="text-sm text-slate-500">
          Memuat profil...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-yellow-700">
            Akun Saya
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Profil Pengguna
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola informasi profil dan keamanan akun kamu.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Informasi Profil
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Perbarui nama dan bio profil kamu.
              </p>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-yellow-400 text-2xl font-bold text-slate-900">
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={`Foto profil ${profile.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.name
                    ?.charAt(0)
                    .toUpperCase() || "U"
                )}
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {profile?.name || "Pengguna"}
                </p>

                <p className="text-sm text-slate-500">
                  {profile?.email || "-"}
                </p>

                <label className="mt-2 inline-block cursor-pointer text-sm font-semibold text-yellow-700 hover:text-yellow-800">
                  {isChangeProfilePhoto
                    ? "Mengunggah..."
                    : "Ganti foto"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isChangeProfilePhoto}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nama
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name.value}
                  onChange={name.onChange}
                  disabled={isChangeProfile}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-bio"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Bio
                </label>

                <textarea
                  id="profile-bio"
                  rows={4}
                  value={bio.value}
                  onChange={bio.onChange}
                  placeholder="Ceritakan sedikit tentang kamu..."
                  disabled={isChangeProfile}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isChangeProfile}
                className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChangeProfile
                  ? "Menyimpan..."
                  : "Simpan Profil"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Ubah Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Gunakan password baru yang mudah kamu ingat tetapi tetap aman.
              </p>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="old-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password Lama
                </label>

                <input
                  id="old-password"
                  type="password"
                  value={oldPassword.value}
                  onChange={oldPassword.onChange}
                  disabled={isChangeProfilePassword}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password Baru
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword.value}
                  onChange={newPassword.onChange}
                  disabled={isChangeProfilePassword}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Konfirmasi Password Baru
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword.value}
                  onChange={confirmPassword.onChange}
                  disabled={isChangeProfilePassword}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:bg-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isChangeProfilePassword}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChangeProfilePassword
                  ? "Mengubah..."
                  : "Ubah Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}