import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/helpers/apiHelper";
import {
  addComment,
  addPost,
  deleteAllPosts,
  deleteComment,
  deletePost,
  getPost,
  getPosts,
  likePost,
  updatePost,
  updatePostCover,
} from "@/features/posts/api/postApi";

vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = vi.mocked(apiFetch);

describe("postApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPosts mengambil semua postingan tanpa filter", async () => {
    const response = {
      status: "success",
      message: "Berhasil mengambil postingan",
      data: {
        posts: [],
      },
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await getPosts();

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts",
      {
        method: "GET",
        query: undefined,
      }
    );
  });

  it("getPosts mengambil postingan milik pengguna aktif", async () => {
    const response = {
      status: "success",
      message: "Berhasil",
      data: {
        posts: [],
      },
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await getPosts(true);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts",
      {
        method: "GET",
        query: {
          is_me: 1,
        },
      }
    );
  });

  it("getPost mengambil detail postingan berdasarkan ID", async () => {
    const response = {
      status: "success",
      message: "Berhasil",
      data: {
        post: {
          id: 10,
        },
      },
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await getPost(10);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts/10",
      {
        method: "GET",
      }
    );
  });

  it("addPost menambahkan postingan baru", async () => {
    const data = {
      description: "Postingan baru",
    };

    const response = {
      status: "success",
      message: "Postingan berhasil ditambahkan",
      data: {
        post_id: 25,
      },
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await addPost(data);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  });

  it("updatePost memperbarui deskripsi postingan", async () => {
    const data = {
      description: "Deskripsi yang diperbarui",
    };

    const response = {
      status: "success",
      message: "Postingan berhasil diperbarui",
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await updatePost(15, data);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts/15",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  });

  it("updatePostCover mengunggah cover postingan", async () => {
    const file = new File(
      ["cover image"],
      "cover.jpg",
      {
        type: "image/jpeg",
      }
    );

    const response = {
      status: "success",
      message: "Cover berhasil diperbarui",
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await updatePostCover(20, file);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledTimes(1);

    const [url, options] =
      mockApiFetch.mock.calls[0];

    expect(url).toBe(
      "/api/v1/posts/20/cover"
    );

    expect(options?.method).toBe("POST");
    expect(options?.body).toBeInstanceOf(FormData);

    const formData =
      options?.body as FormData;

    expect(formData.get("cover")).toBe(file);
  });

  it("deletePost menghapus satu postingan", async () => {
    const response = {
      status: "success",
      message: "Postingan berhasil dihapus",
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await deletePost(30);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts/30",
      {
        method: "DELETE",
      }
    );
  });

  it("likePost mengirim status like", async () => {
    const data = {
      like: 1 as const,
    };

    const response = {
      status: "success",
      message: "Like berhasil",
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await likePost(40, data);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts/40/likes",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  });

  it("addComment menambahkan komentar", async () => {
    const data = {
      comment: "Komentar saya",
    };

    const response = {
      status: "success",
      message: "Komentar berhasil ditambahkan",
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await addComment(50, data);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts/50/comments",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  });

  it("deleteComment menghapus komentar pengguna", async () => {
    const response = {
      status: "success",
      message: "Komentar berhasil dihapus",
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await deleteComment(60);

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts/60/comments",
      {
        method: "DELETE",
      }
    );
  });

  it("deleteAllPosts menghapus seluruh postingan pengguna", async () => {
    const response = {
      status: "success",
      message: "Semua postingan berhasil dihapus",
    };

    mockApiFetch.mockResolvedValue(response);

    const result = await deleteAllPosts();

    expect(result).toEqual(response);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/v1/posts",
      {
        method: "DELETE",
      }
    );
  });
});