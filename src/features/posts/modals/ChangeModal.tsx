"use client";

import { useEffect, useState } from "react";

import { changePost } from "@/features/posts/states/reducer";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  showErrorDialog,
  showSuccessDialog,
} from "@/helpers/toolsHelper";

interface ChangeModalProps {
  open: boolean;
  postId: number | null;
  currentDescription: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ChangeModal({
  open,
  postId,
  currentDescription,
  onClose,
  onSuccess,
}: ChangeModalProps) {
  const dispatch = useAppDispatch();

  const { isPostChange, isPostChanged, error } =
    useAppSelector((state) => state.posts);

  const [description, setDescription] = useState(
    currentDescription
  );

  useEffect(() => {
    if (open) {
      setDescription(currentDescription);
    }
  }, [currentDescription, open]);

  useEffect(() => {
    if (!isPostChanged) {
      return;
    }

    const handleSuccess = async () => {
      await showSuccessDialog(
        "Postingan berhasil diubah",
        "Deskripsi postingan sudah diperbarui."
      );

      setDescription("");
      onClose();
      onSuccess?.();
    };

    handleSuccess();
  }, [isPostChanged, onClose, onSuccess]);

  useEffect(() => {
    if (error && open) {
      showErrorDialog(
        "Gagal mengubah postingan",
        error
      );
    }
  }, [error, open]);

  if (!open || postId === null) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const value = description.trim();

    if (!value) {
      await showErrorDialog(
        "Deskripsi belum diisi",
        "Silakan isi deskripsi postingan terlebih dahulu."
      );

      return;
    }

    if (value === currentDescription.trim()) {
      await showErrorDialog(
        "Tidak ada perubahan",
        "Silakan ubah deskripsi sebelum menyimpan."
      );

      return;
    }

    await dispatch(
      changePost({
        postId,
        description: value,
      })
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-post-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="change-post-title"
              className="text-lg font-bold text-slate-900"
            >
              Ubah Postingan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Perbarui isi deskripsi postingan kamu.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPostChange}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Tutup modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label
              htmlFor="change-post-description"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Deskripsi Postingan
            </label>

            <textarea
              id="change-post-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Tulis deskripsi postingan..."
              rows={6}
              disabled={isPostChange}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {description.length} karakter
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPostChange}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                isPostChange ||
                !description.trim()
              }
              className="rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPostChange
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}