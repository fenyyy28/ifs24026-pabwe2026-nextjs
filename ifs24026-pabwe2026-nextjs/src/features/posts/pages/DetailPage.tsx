"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import PostLayout from "@/features/posts/layouts/PostLayout";

import {
  getPost,
  updatePost,
  updatePostCover,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  type Post,
} from "@/features/posts/api/postApi";

import { getMyProfile } from "@/features/users/api/userApi";

import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/helpers/toolsHelper";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();

  const postId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [comment, setComment] = useState("");

  const [isSubmittingComment, setIsSubmittingComment] =
    useState(false);

  const [isLiking, setIsLiking] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [description, setDescription] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);

  const [isChangingCover, setIsChangingCover] =
    useState(false);

  const [isDeletingComment, setIsDeletingComment] =
    useState(false);

  /*
   * =====================================================
   * AMBIL PROFILE USER YANG SEDANG LOGIN
   * =====================================================
   */
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoadingProfile(true);

        const response = await getMyProfile();

        console.log("DEBUG PROFILE", response.data);

        const userId = Number(response.data.user.id);

        console.log("DEBUG CURRENT USER ID", userId);

        setCurrentUserId(userId);
      } catch (error) {
        console.error(
          "Gagal mengambil profile:",
          error
        );

        await showErrorDialog(
          "Gagal memuat akun",
          error instanceof Error
            ? error.message
            : "Data akun tidak dapat dimuat."
        );
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  /*
   * =====================================================
   * AMBIL DETAIL POST
   * =====================================================
   */
  useEffect(() => {
    async function loadPost() {
      if (!postId || Number.isNaN(postId)) {
        await showErrorDialog(
          "Postingan tidak ditemukan",
          "ID postingan tidak valid."
        );

        router.replace("/dashboard");
        return;
      }

      try {
        setLoadingPost(true);

        const response = await getPost(postId);

        console.log(
          "DEBUG POST",
          response.data.post
        );

        setPost(response.data.post);

        setDescription(
          response.data.post.description
        );
      } catch (error) {
        console.error(
          "Gagal mengambil postingan:",
          error
        );

        await showErrorDialog(
          "Gagal memuat postingan",
          error instanceof Error
            ? error.message
            : "Postingan tidak dapat dimuat."
        );

        router.replace("/dashboard");
      } finally {
        setLoadingPost(false);
      }
    }

    loadPost();
  }, [postId, router]);

  /*
   * =====================================================
   * CEK POSTINGAN MILIK USER
   * =====================================================
   */
  const isMyPost =
    post !== null &&
    currentUserId !== null &&
    Number(post.user_id) === Number(currentUserId);

  /*
   * =====================================================
   * CEK LIKE
   * =====================================================
   */
  const isLiked = useMemo(() => {
    if (!post || currentUserId === null) {
      return false;
    }

    return (
      post.likes?.some(
        (userId) =>
          Number(userId) === Number(currentUserId)
      ) ?? false
    );
  }, [post, currentUserId]);

  /*
   * =====================================================
   * DEBUG
   * =====================================================
   */
  useEffect(() => {
    console.log("DEBUG RENDER OWNER BUTTON", {
      postId: post?.id,
      postUserId: post?.user_id,
      currentUserId,
      isMyPost,
    });
  }, [post, currentUserId, isMyPost]);

  /*
   * =====================================================
   * REFRESH POST
   * =====================================================
   */
  const refreshPost = async () => {
    try {
      const response = await getPost(postId);

      setPost(response.data.post);

      setDescription(
        response.data.post.description
      );
    } catch (error) {
      console.error(
        "Gagal refresh post:",
        error
      );
    }
  };

  /*
   * =====================================================
   * LIKE
   * =====================================================
   */
  const handleLike = async () => {
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

  /*
   * =====================================================
   * KOMENTAR
   * =====================================================
   */
  const handleComment = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

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

  /*
   * =====================================================
   * UBAH POST
   * =====================================================
   */
  const handleUpdatePost = async () => {
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

  /*
   * =====================================================
   * GANTI COVER
   * =====================================================
   */
  const handleChangeCover = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  /*
   * =====================================================
   * HAPUS POST
   * =====================================================
   */
  const handleDeletePost = async () => {
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

      router.replace("/dashboard");
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

  /*
   * =====================================================
   * HAPUS KOMENTAR
   * =====================================================
   */
  const handleDeleteComment = async () => {
    if (
      !post ||
      !post.my_comment ||
      isDeletingComment
    ) {
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

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */
  if (
    loadingPost ||
    loadingProfile ||
    !post ||
    currentUserId === null
  ) {
    return (
      <PostLayout>
        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" />

            <p className="text-sm font-medium text-slate-600">
              Memuat postingan...
            </p>
          </div>
        </main>
      </PostLayout>
    );
  }

  return (
    <PostLayout>
      <main className="mx-auto max-w-4xl">

        {/* Kembali */}
        <div className="mb-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-yellow-600"
          >
            ← Kembali ke postingan
          </Link>
        </div>

        {/* =================================================
            DETAIL POST
        ================================================= */}
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* COVER */}
          {post.cover ? (
            <div className="aspect-video overflow-hidden bg-slate-100">
              <img
                src={post.cover}
                alt="Cover postingan"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-white">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-bold text-slate-900">
                  P
                </div>

                <p className="text-sm text-slate-500">
                  Tidak ada cover
                </p>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">

            {/* =================================================
                HEADER
            ================================================= */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              {/* USER */}
              <div className="flex items-center gap-3">

                {post.author?.photo ? (
                  <img
                    src={post.author.photo}
                    alt={post.author.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-slate-900">
                    {post.author?.name
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>
                )}

                <div>
                  <h1 className="font-bold text-slate-900">
                    {post.author?.name ||
                      "Pengguna"}
                  </h1>

                  <p className="text-sm text-slate-500">
                    {new Date(
                      post.created_at
                    ).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* =================================================
                  TOMBOL PEMILIK
              ================================================= */}
              {isMyPost && (
                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setIsEditing(true)
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
                  >
                    Ubah
                  </button>

                  <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50">
                    {isChangingCover
                      ? "Mengubah..."
                      : "Cover"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleChangeCover
                      }
                      disabled={
                        isChangingCover
                      }
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={
                      handleDeletePost
                    }
                    disabled={isDeleting}
                    className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    {isDeleting
                      ? "Menghapus..."
                      : "Hapus"}
                  </button>

                </div>
              )}
            </div>

            {/* =================================================
                DESKRIPSI
            ================================================= */}
            {isEditing ? (
              <div className="mt-7">

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
                />

                <div className="mt-3 flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setDescription(
                        post.description
                      );

                      setIsEditing(false);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleUpdatePost
                    }
                    disabled={isUpdating}
                    className="rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {isUpdating
                      ? "Menyimpan..."
                      : "Simpan"}
                  </button>

                </div>
              </div>
            ) : (
              <p className="mt-7 whitespace-pre-wrap text-base leading-8 text-slate-700">
                {post.description}
              </p>
            )}

            {/* =================================================
                LIKE
            ================================================= */}
            <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">

              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isLiked
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-100 text-slate-700 hover:bg-yellow-100"
                }`}
              >
                {isLiked
                  ? "♥ Disukai"
                  : "♡ Suka"}
              </button>

              <span className="text-sm text-slate-500">
                {post.likes?.length || 0} suka
              </span>

              <span className="text-slate-300">
                •
              </span>

              <span className="text-sm text-slate-500">
                {post.comments?.length || 0}{" "}
                komentar
              </span>

            </div>
          </div>
        </article>

        {/* =================================================
            KOMENTAR
        ================================================= */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="text-xl font-bold text-slate-900">
            Komentar
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Bagikan pendapat kamu tentang
            postingan ini.
          </p>

          {/* FORM KOMENTAR */}
          <form
            onSubmit={handleComment}
            className="mt-6"
          >
            <textarea
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              rows={4}
              placeholder="Tulis komentar..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
            />

            <div className="mt-3 flex justify-end">

              <button
                type="submit"
                disabled={
                  isSubmittingComment
                }
                className="rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-yellow-300 disabled:opacity-50"
              >
                {isSubmittingComment
                  ? "Mengirim..."
                  : "Kirim Komentar"}
              </button>

            </div>
          </form>

          {/* DAFTAR KOMENTAR */}
          <div className="mt-7 space-y-4">

            {!post.comments ||
            post.comments.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-600">
                  Belum ada komentar.
                </p>
              </div>
            ) : (
              post.comments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    Komentar
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {item.comment}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(
                      item.created_at
                    ).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              ))
            )}

          </div>

          {/* HAPUS KOMENTAR SENDIRI */}
          {post.my_comment && (
            <div className="mt-5 flex justify-end">

              <button
                type="button"
                onClick={
                  handleDeleteComment
                }
                disabled={
                  isDeletingComment
                }
                className="text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {isDeletingComment
                  ? "Menghapus..."
                  : "Hapus komentar saya"}
              </button>

            </div>
          )}

        </section>
      </main>
    </PostLayout>
  );
}