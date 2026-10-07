import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/helpers/apiHelper";

import {
  getPosts,
  getPost,
  addPost,
  updatePost,
  updatePostCover,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  deleteAllPosts,
} from "./postApi";

vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

describe("postApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPosts", () => {
    it("mengambil semua postingan", async () => {
      const response = {
        status: "success",
        message: "Berhasil",
        data: {
          posts: [],
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await getPosts();

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts",
        {
          method: "GET",
          query: undefined,
        }
      );

      expect(result).toEqual(response);
    });

    it("mengambil postingan milik user", async () => {
      const response = {
        status: "success",
        message: "Berhasil",
        data: {
          posts: [],
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await getPosts(true);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts",
        {
          method: "GET",
          query: {
            is_me: 1,
          },
        }
      );

      expect(result).toEqual(response);
    });

    it("meneruskan error dari apiFetch", async () => {
      const error = new Error("Gagal mengambil postingan");

      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(getPosts()).rejects.toThrow(
        "Gagal mengambil postingan"
      );
    });
  });

  describe("getPost", () => {
    it("mengambil detail postingan", async () => {
      const response = {
        status: "success",
        message: "Berhasil",
        data: {
          post: {} as never,
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await getPost(10);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts/10",
        {
          method: "GET",
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("addPost", () => {
    it("menambahkan postingan", async () => {
      const data = {
        description: "Postingan baru",
      };

      const response = {
        status: "success",
        message: "Berhasil",
        data: {
          post_id: 1,
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await addPost(data);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("updatePost", () => {
    it("mengubah postingan", async () => {
      const data = {
        description: "Postingan yang diubah",
      };

      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await updatePost(5, data);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts/5",
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("updatePostCover", () => {
    it("mengubah cover postingan", async () => {
      const file = new File(
        ["gambar"],
        "cover.jpg",
        {
          type: "image/jpeg",
        }
      );

      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await updatePostCover(7, file);

      expect(apiFetch).toHaveBeenCalledTimes(1);

      const call = vi.mocked(apiFetch).mock.calls[0];

      expect(call[0]).toBe(
        "/api/v1/posts/7/cover"
      );

      expect(call[1]?.method).toBe("POST");
      expect(call[1]?.body).toBeInstanceOf(FormData);

      const formData = call[1]?.body as FormData;

      expect(formData.get("cover")).toBe(file);

      expect(result).toEqual(response);
    });
  });

  describe("deletePost", () => {
    it("menghapus satu postingan", async () => {
      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await deletePost(8);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts/8",
        {
          method: "DELETE",
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("likePost", () => {
    it("memberikan like", async () => {
      const data = {
        like: 1 as const,
      };

      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await likePost(9, data);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts/9/likes",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(response);
    });

    it("menghapus like", async () => {
      const data = {
        like: 0 as const,
      };

      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await likePost(9, data);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts/9/likes",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("addComment", () => {
    it("menambahkan komentar", async () => {
      const data = {
        comment: "Komentar baru",
      };

      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await addComment(3, data);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts/3/comments",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("deleteComment", () => {
    it("menghapus komentar", async () => {
      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await deleteComment(4);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts/4/comments",
        {
          method: "DELETE",
        }
      );

      expect(result).toEqual(response);
    });
  });

  describe("deleteAllPosts", () => {
    it("menghapus semua postingan", async () => {
      const response = {
        status: "success",
        message: "Berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await deleteAllPosts();

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/posts",
        {
          method: "DELETE",
        }
      );

      expect(result).toEqual(response);
    });
  });
});