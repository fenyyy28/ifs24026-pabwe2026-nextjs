"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import AddModal from "@/features/posts/modals/AddModal";
import PostLayout from "@/features/posts/layouts/PostLayout";
import { fetchPosts } from "@/features/posts/states/reducer";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { formatDate, showErrorDialog } from "@/helpers/toolsHelper";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const { posts, isPost, error } = useAppSelector(
    (state) => state.posts
  );

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isMyPosts = searchParams.get("is_me") === "1";

  useEffect(() => {
    dispatch(fetchPosts(isMyPosts));
  }, [dispatch, isMyPosts]);

  useEffect(() => {
    if (error) {
      showErrorDialog("Gagal memuat postingan", error);
    }
  }, [error]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.description.toLowerCase().includes(keyword) ||
        post.author.name.toLowerCase().includes(keyword)
    );
  }, [posts, search]);

  return (
    <PostLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-yellow-400 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                {isMyPosts ? "Postingan Saya" : "Semua Postingan"}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {isMyPosts
                  ? "Postingan Saya"
                  : "Temukan Postingan"}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700">
                Bagikan cerita, pengalaman, dan informasi bersama
                pengguna Delcom Posts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              + Buat Postingan
            </button>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari postingan atau nama pengguna..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
            />
          </div>
        </div>

        {isPost && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" />
            <p className="text-sm font-medium text-slate-600">
              Memuat postingan...
            </p>
          </div>
        )}

        {!isPost && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-2xl">
              📝
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Belum ada postingan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Belum ada postingan yang sesuai dengan pencarian
              kamu.
            </p>
          </div>
        )}

        {!isPost && filteredPosts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Link href={`/posts/${post.id}`}>
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {post.cover ? (
                      <img
                        src={post.cover}
                        alt={`Cover postingan ${post.description}`}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-yellow-100">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-yellow-400 font-bold text-slate-900">
                      {post.author.photo ? (
                        <img
                          src={post.author.photo}
                          alt={`Foto ${post.author.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        post.author.name
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {post.author.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <Link href={`/posts/${post.id}`}>
                    <h2 className="line-clamp-3 text-base font-semibold leading-6 text-slate-900 transition hover:text-yellow-600">
                      {post.description}
                    </h2>
                  </Link>

                  <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                    <span>
                      ❤️ {post.likes.length} Like
                    </span>

                    <span>
                      💬 {post.comments.length} Komentar
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isPost && posts.length > 0 && (
          <p className="text-sm text-slate-500">
            Menampilkan {filteredPosts.length} dari{" "}
            {posts.length} postingan.
          </p>
        )}
      </div>

      <AddModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </PostLayout>
  );
}