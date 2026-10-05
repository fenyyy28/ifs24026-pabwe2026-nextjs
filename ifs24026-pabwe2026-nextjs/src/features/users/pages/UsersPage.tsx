"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchUsers } from "@/features/users/states/reducer";
import { showErrorDialog } from "@/helpers/toolsHelper";

export default function UsersPage() {
  const dispatch = useAppDispatch();

  const { users, error } = useAppSelector((state) => state.users);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showErrorDialog("Gagal memuat pengguna", error);
    }
  }, [error]);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return safeUsers;
    }

    return safeUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
    );
  }, [safeUsers, search]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-yellow-600">
            Pengguna
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Daftar Pengguna
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Lihat pengguna yang terdaftar di Delcom Posts.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <h2 className="font-semibold text-slate-800">
                Pengguna tidak ditemukan
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Coba gunakan kata kunci pencarian yang berbeda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-6 py-5 transition hover:bg-yellow-50/50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-slate-900">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900">
                      {user.name}
                    </h2>

                    <p className="truncate text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Menampilkan {filteredUsers.length} dari {safeUsers.length} pengguna.
        </p>
      </div>
    </main>
  );
}