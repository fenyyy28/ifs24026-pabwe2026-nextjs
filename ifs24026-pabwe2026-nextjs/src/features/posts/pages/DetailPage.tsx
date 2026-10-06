
"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  addComment,
  deleteComment,
  deletePost,
  getPost,
  likePost,
  updatePost,
  updatePostCover,
  type Post,
} from "@/features/posts/api/postApi";

import { getMyProfile } from "@/features/users/api/userApi";

import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/lib/dialog";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();

  const postId = Number(params.postId);

  const [post, setPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingCover, setIsChangingCover] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const isMyPost =
    post !== null &&
    currentUserId !== null &&
    post.user_id === currentUserId;

  const isLiked =
    post !== null &&
    currentUserId !== null &&
    (post.likes ?? []).includes(currentUserId);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMyProfile();

        setCurrentUserId(response.data.user.id);
      } catch (error) {
        console.error("Gagal mengambil profile:", error);

        await showErrorDialog(
          "Gagal memuat akun",
          error instanceof Error
            ? error.message
            : "Data akun tidak dapat dimuat."
        );
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!Number.isFinite(postId) || postId <= 0) {
      return;
    }

    const loadPost = async () => {
      try {
        const response = await getPost(postId);

        setPost(response.data.post);
        setDescription(response.data.post.description);
      } catch (error) {
        console.error("Gagal mengambil postingan:", error);

        await showErrorDialog(
          "Gagal memuat postingan",
          error instanceof Error
            ? error.message
            : "Postingan tidak dapat dimuat."
        );

        router.replace("/");
      }
    };

    loadPost();
  }, [postId, router]);

  const refreshPost = async () => {
    try {
      const response = await getPost(postId);

      setPost(response.data.post);
      setDescription(response.data.post.description);
    } catch (error) {
      console.error("Gagal refresh post:", error);
    }
  };

  const handleLike = async () => {
  /* v8 ignore next -- @preserve */
if (!post || isLiking) {
  return;
}

    setIsLiking(true);

    try {
      await likePost(post.id, {
        like: isLiked ? 0 : 1,
      });

      await refreshPost();
    } catch (error) {
      await showErrorDialog(
        "Like gagal",
        error instanceof Error
          ? error.message
          : "Gagal memberikan like."
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /* v8 ignore next -- @preserve */
if (!post || isSubmittingComment) {
  return;
}

    const value = comment.trim();

    if (!value) {
      await showErrorDialog(
        "Komentar kosong",
        "Silakan tulis komentar terlebih dahulu."
      );

      return;
    }

    setIsSubmittingComment(true);

    try {
      await addComment(post.id, {
        comment: value,
      });

      setComment("");

      await refreshPost();

      await showSuccessDialog(
        "Komentar berhasil",
        "Komentar berhasil ditambahkan."
      );
    } catch (error) {
      await showErrorDialog(
        "Komentar gagal",
        error instanceof Error
          ? error.message
          : "Gagal menambahkan komentar."
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdatePost = async () => {
   /* v8 ignore next -- @preserve */
if (!post) {
  return;
}

    const value = description.trim();

    if (!value) {
      await showErrorDialog(
        "Deskripsi kosong",
        "Deskripsi postingan tidak boleh kosong."
      );

      return;
    }

    setIsUpdating(true);

    try {
      await updatePost(post.id, {
        description: value,
      });

      await refreshPost();

      setIsEditing(false);

      await showSuccessDialog(
        "Berhasil",
        "Postingan berhasil diperbarui."
      );
    } catch (error) {
      await showErrorDialog(
        "Gagal memperbarui",
        error instanceof Error
          ? error.message
          : "Postingan gagal diperbarui."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeCover = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    /* v8 ignore next -- @preserve */
if (!post) {
  return;
}
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      await showErrorDialog(
        "File tidak valid",
        "Silakan pilih file gambar."
      );

      event.target.value = "";

      return;
    }

    setIsChangingCover(true);

    try {
      await updatePostCover(post.id, file);

      await refreshPost();

      await showSuccessDialog(
        "Berhasil",
        "Cover postingan berhasil diperbarui."
      );
    } catch (error) {
      await showErrorDialog(
        "Gagal mengubah cover",
        error instanceof Error
          ? error.message
          : "Cover gagal diperbarui."
      );
    } finally {
      setIsChangingCover(false);
      event.target.value = "";
    }
  };

  const handleDeletePost = async () => {
    /* v8 ignore next -- @preserve */
if (!post || isDeleting) {
  return;
}

    const confirmed = await showConfirmDialog(
      "Hapus postingan?",
      "Postingan akan dihapus secara permanen."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePost(post.id);

      await showSuccessDialog(
        "Berhasil",
        "Postingan berhasil dihapus."
      );

      router.replace("/");
    } catch (error) {
      await showErrorDialog(
        "Gagal menghapus",
        error instanceof Error
          ? error.message
          : "Postingan gagal dihapus."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async () => {
    /* v8 ignore next -- @preserve */
if (!post || !post.my_comment || isDeletingComment) {
  return;
}

    const confirmed = await showConfirmDialog(
      "Hapus komentar?",
      "Komentar kamu akan dihapus."
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingComment(true);

    try {
      await deleteComment(post.id);

      await refreshPost();

      await showSuccessDialog(
        "Berhasil",
        "Komentar berhasil dihapus."
      );
    } catch (error) {
      await showErrorDialog(
        "Gagal menghapus komentar",
        error instanceof Error
          ? error.message
          : "Komentar gagal dihapus."
      );
    } finally {
      setIsDeletingComment(false);
    }
  };

  if (!Number.isFinite(postId) || postId <= 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Postingan tidak ditemukan
            </h1>

            <p className="mt-2 text-slate-600">
              ID postingan tidak valid.
            </p>

            <button
              type="button"
              onClick={() => router.replace("/")}
              className="mt-6 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600"
            >
              Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!post || currentUserId === null) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-500" />

            <p className="mt-4 text-slate-600">
              Memuat postingan...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const likes = post.likes ?? [];
  const comments = post.comments ?? [];
  const authorName = post.author.name?.trim() || "Pengguna";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative">
            {post.cover ? (
              <img
                src={post.cover}
                alt="Cover postingan"
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-slate-200 text-slate-500">
                Tidak ada cover
              </div>
            )}

            {isMyPost && (
              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isUpdating || isDeleting}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ubah
                </button>

                <label className="cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow transition hover:bg-slate-100">
                  {isChangingCover ? "Mengubah..." : "Cover"}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isChangingCover || isDeleting}
                    onChange={handleChangeCover}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleDeletePost}
                  disabled={
                    isDeleting ||
                    isUpdating ||
                    isChangingCover
                  }
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3">
              {post.author.photo ? (
                <img
                  src={post.author.photo}
                  alt={authorName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100 font-bold text-yellow-700">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <p className="font-semibold text-slate-900">
                  {authorName}
                </p>

                <p className="text-sm text-slate-500">
                  {new Date(
                    post.created_at
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-6">
                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={6}
                  className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={handleUpdatePost}
                    disabled={isUpdating}
                    className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdating
                      ? "Menyimpan..."
                      : "Simpan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDescription(post.description);
                      setIsEditing(false);
                    }}
                    disabled={isUpdating}
                    className="rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-slate-800">
                {post.description}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                className={`rounded-xl px-5 py-3 font-semibold transition ${
                  isLiked
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isLiking
                  ? "Memproses..."
                  : isLiked
                    ? "♥ Disukai"
                    : "♡ Suka"}
              </button>

              <span className="text-sm text-slate-500">
                {likes.length} suka
              </span>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Komentar
                </h2>

                <span className="text-sm text-slate-500">
                  {comments.length} komentar
                </span>
              </div>

              <form
                onSubmit={handleComment}
                className="mt-4"
              >
                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  rows={4}
                  placeholder="Tulis komentar..."
                  disabled={isSubmittingComment}
                  className="w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="mt-3 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingComment
                    ? "Mengirim..."
                    : "Kirim Komentar"}
                </button>
              </form>

              <div className="mt-6 space-y-4">
                {comments.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-5 text-center text-slate-500">
                    Belum ada komentar.
                  </p>
                ) : (
                  comments.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <p className="text-slate-800">
                        {item.comment}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(
                          item.created_at
                        ).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  ))
                )}

                {post.my_comment && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleDeleteComment}
                      disabled={isDeletingComment}
                      className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeletingComment
                        ? "Menghapus..."
                        : "Hapus Komentar Saya"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

