"use client";

import { useEffect, useState } from "react";

import { changePostCover } from "@/features/posts/states/reducer";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  showErrorDialog,
  showSuccessDialog,
} from "@/helpers/toolsHelper";

interface ChangeCoverModalProps {
  open: boolean;
  postId: number | null;
  currentCover?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ChangeCoverModal({
  open,
  postId,
  currentCover,
  onClose,
  onSuccess,
}: ChangeCoverModalProps) {
  const dispatch = useAppDispatch();

  const { isPostChangeCover, isPostChangedCover, error } =
    useAppSelector((state) => state.posts);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    currentCover || null
  );

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(currentCover || null);
      return;
    }

    setFile(null);
    setPreview(currentCover || null);
  }, [currentCover, open]);

  useEffect(() => {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    if (!isPostChangedCover) {
      return;
    }

    const handleSuccess = async () => {
      await showSuccessDialog(
        "Cover berhasil diubah",
        "Cover postingan sudah berhasil diperbarui."
      );

      setFile(null);
      onClose();
      onSuccess?.();
    };

    handleSuccess();
  }, [
    isPostChangedCover,
    onClose,
    onSuccess,
  ]);

  useEffect(() => {
    if (error && open) {
      showErrorDialog(
        "Gagal mengubah cover",
        error
      );
    }
  }, [error, open]);

  if (!open || postId === null) {
    return null;
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      showErrorDialog(
        "File tidak valid",
        "Silakan pilih file gambar."
      );

      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      showErrorDialog(
        "Ukuran file terlalu besar",
        "Ukuran gambar maksimal 5 MB."
      );

      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!file) {
      await showErrorDialog(
        "Pilih gambar terlebih dahulu",
        "Silakan pilih gambar yang ingin digunakan sebagai cover."
      );

      return;
    }

    await dispatch(
      changePostCover({
        postId,
        file,
      })
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-cover-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="change-cover-title"
              className="text-lg font-bold text-slate-900"
            >
              Ubah Cover
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pilih gambar baru untuk cover postingan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPostChangeCover}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Tutup modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview cover postingan"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl">🖼️</div>
                    <p className="mt-2 text-sm text-slate-500">
                      Belum ada gambar
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="post-cover"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Pilih Gambar
              </label>

              <input
                id="post-cover"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isPostChangeCover}
                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-yellow-400 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                Format gambar dan maksimal ukuran 5 MB.
              </p>

              {file && (
                <p className="mt-2 truncate text-xs font-medium text-slate-600">
                  File dipilih: {file.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPostChangeCover}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isPostChangeCover || !file}
              className="rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPostChangeCover
                ? "Mengupload..."
                : "Simpan Cover"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}