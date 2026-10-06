import { describe, expect, it, vi } from "vitest";

import reducer, {
  fetchPosts,
  fetchPost,
  addPostThunk,
  changePost,
  changePostCover,
  deletePostThunk,
  likePostThunk,
  addCommentThunk,
  deleteCommentThunk,
  deleteAllPostsThunk,
} from "./reducer";

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
} from "@/features/posts/api/postApi";

vi.mock("@/features/posts/api/postApi", () => ({
  getPosts: vi.fn(),
  getPost: vi.fn(),
  addPost: vi.fn(),
  updatePost: vi.fn(),
  updatePostCover: vi.fn(),
  deletePost: vi.fn(),
  likePost: vi.fn(),
  addComment: vi.fn(),
  deleteComment: vi.fn(),
  deleteAllPosts: vi.fn(),
}));

const post = {
  id: 1,
  user_id: 10,
  description: "Post test",
  likes: [],
} as any;

const initialState = {
  posts: [],
  post: null,
  isPost: false,
  isPostAdd: false,
  isPostAdded: false,
  isPostChange: false,
  isPostChanged: false,
  isPostChangeCover: false,
  isPostChangedCover: false,
  isPostDelete: false,
  isPostDeleted: false,
  isPostLike: false,
  isPostLiked: false,
  isPostAddComment: false,
  isPostAddedComment: false,
  isPostDeleteComment: false,
  isPostDeletedComment: false,
  isPostDeleteAll: false,
  isPostDeletedAll: false,
  error: null,
};

describe("Posts reducer", () => {
  it("initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  it("fetchPosts pending", () => {
    const state = reducer(
      initialState,
      fetchPosts.pending("request")
    );

    expect(state.isPost).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchPosts fulfilled", () => {
    const state = reducer(
      initialState,
      fetchPosts.fulfilled([post], "request", false)
    );

    expect(state.isPost).toBe(false);
    expect(state.posts).toEqual([post]);
    expect(state.error).toBeNull();
  });

  it("fetchPosts rejected", () => {
    const state = reducer(
      initialState,
      fetchPosts.rejected(
        new Error("error"),
        "request",
        false,
        "error"
      )
    );

    expect(state.isPost).toBe(false);
    expect(state.error).toBe("error");
  });

  it("fetchPost pending", () => {
    const state = reducer(
      initialState,
      fetchPost.pending("request", 1)
    );

    expect(state.isPost).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchPost fulfilled", () => {
    const state = reducer(
      initialState,
      fetchPost.fulfilled(post, "request", 1)
    );

    expect(state.isPost).toBe(false);
    expect(state.post).toEqual(post);
    expect(state.error).toBeNull();
  });

  it("fetchPost rejected", () => {
    const state = reducer(
      initialState,
      fetchPost.rejected(
        new Error("error"),
        "request",
        1,
        "error"
      )
    );

    expect(state.isPost).toBe(false);
    expect(state.error).toBe("error");
  });

  it("addPost pending", () => {
    const state = reducer(
      initialState,
      addPostThunk.pending(
        "request",
        { description: "test" }
      )
    );

    expect(state.isPostAdd).toBe(true);
    expect(state.isPostAdded).toBe(false);
    expect(state.error).toBeNull();
  });

  it("addPost fulfilled", () => {
    const state = reducer(
      initialState,
      addPostThunk.fulfilled(
        { message: "success" } as any,
        "request",
        { description: "test" }
      )
    );

    expect(state.isPostAdd).toBe(false);
    expect(state.isPostAdded).toBe(true);
    expect(state.error).toBeNull();
  });

  it("addPost rejected", () => {
    const state = reducer(
      initialState,
      addPostThunk.rejected(
        new Error("error"),
        "request",
        { description: "test" },
        "error"
      )
    );

    expect(state.isPostAdd).toBe(false);
    expect(state.isPostAdded).toBe(false);
    expect(state.error).toBe("error");
  });

  it("changePost pending", () => {
    const state = reducer(
      initialState,
      changePost.pending(
        "request",
        { postId: 1, description: "test" }
      )
    );

    expect(state.isPostChange).toBe(true);
    expect(state.isPostChanged).toBe(false);
    expect(state.error).toBeNull();
  });

  it("changePost fulfilled", () => {
    const state = reducer(
      initialState,
      changePost.fulfilled(
        { message: "success" } as any,
        "request",
        { postId: 1, description: "test" }
      )
    );

    expect(state.isPostChange).toBe(false);
    expect(state.isPostChanged).toBe(true);
    expect(state.error).toBeNull();
  });

  it("changePost rejected", () => {
    const state = reducer(
      initialState,
      changePost.rejected(
        new Error("error"),
        "request",
        { postId: 1, description: "test" },
        "error"
      )
    );

    expect(state.isPostChange).toBe(false);
    expect(state.isPostChanged).toBe(false);
    expect(state.error).toBe("error");
  });

  it("changePostCover pending", () => {
    const file = new File(["test"], "cover.jpg");

    const state = reducer(
      initialState,
      changePostCover.pending(
        "request",
        { postId: 1, file }
      )
    );

    expect(state.isPostChangeCover).toBe(true);
    expect(state.isPostChangedCover).toBe(false);
    expect(state.error).toBeNull();
  });

  it("changePostCover fulfilled", () => {
    const file = new File(["test"], "cover.jpg");

    const state = reducer(
      initialState,
      changePostCover.fulfilled(
        { message: "success" } as any,
        "request",
        { postId: 1, file }
      )
    );

    expect(state.isPostChangeCover).toBe(false);
    expect(state.isPostChangedCover).toBe(true);
    expect(state.error).toBeNull();
  });

  it("changePostCover rejected", () => {
    const file = new File(["test"], "cover.jpg");

    const state = reducer(
      initialState,
      changePostCover.rejected(
        new Error("error"),
        "request",
        { postId: 1, file },
        "error"
      )
    );

    expect(state.isPostChangeCover).toBe(false);
    expect(state.isPostChangedCover).toBe(false);
    expect(state.error).toBe("error");
  });

  it("deletePost pending", () => {
    const state = reducer(
      initialState,
      deletePostThunk.pending("request", 1)
    );

    expect(state.isPostDelete).toBe(true);
    expect(state.isPostDeleted).toBe(false);
    expect(state.error).toBeNull();
  });

  it("deletePost fulfilled dengan detail yang sama", () => {
    const state = reducer(
      {
        ...initialState,
        posts: [post],
        post,
      },
      deletePostThunk.fulfilled(
        { message: "success" } as any,
        "request",
        1
      )
    );

    expect(state.isPostDelete).toBe(false);
    expect(state.isPostDeleted).toBe(true);
    expect(state.posts).toEqual([]);
    expect(state.post).toBeNull();
    expect(state.error).toBeNull();
  });

  it("deletePost fulfilled tanpa detail yang sama", () => {
    const anotherPost = {
      ...post,
      id: 99,
    };

    const state = reducer(
      {
        ...initialState,
        posts: [post, anotherPost],
        post: anotherPost,
      },
      deletePostThunk.fulfilled(
        { message: "success" } as any,
        "request",
        1
      )
    );

    expect(state.posts).toEqual([anotherPost]);
    expect(state.post).toEqual(anotherPost);
  });

  it("deletePost rejected", () => {
    const state = reducer(
      initialState,
      deletePostThunk.rejected(
        new Error("error"),
        "request",
        1,
        "error"
      )
    );

    expect(state.isPostDelete).toBe(false);
    expect(state.isPostDeleted).toBe(false);
    expect(state.error).toBe("error");
  });

  it("likePost pending", () => {
    const state = reducer(
      initialState,
      likePostThunk.pending(
        "request",
        { postId: 1, like: 1 }
      )
    );

    expect(state.isPostLike).toBe(true);
    expect(state.isPostLiked).toBe(false);
    expect(state.error).toBeNull();
  });

  it("likePost fulfilled like 1", () => {
    const currentPost = {
      ...post,
      likes: [],
    };

    const state = reducer(
      {
        ...initialState,
        posts: [currentPost],
      },
      likePostThunk.fulfilled(
        {
          message: "success",
          postId: 1,
          like: 1,
        } as any,
        "request",
        { postId: 1, like: 1 }
      )
    );

    expect(state.isPostLike).toBe(false);
    expect(state.isPostLiked).toBe(true);
    expect(state.posts[0].likes).toEqual([10]);
    expect(state.error).toBeNull();
  });

  it("likePost fulfilled like 0", () => {
    const currentPost = {
      ...post,
      likes: [10],
    };

    const state = reducer(
      {
        ...initialState,
        posts: [currentPost],
      },
      likePostThunk.fulfilled(
        {
          message: "success",
          postId: 1,
          like: 0,
        } as any,
        "request",
        { postId: 1, like: 0 }
      )
    );

    expect(state.isPostLiked).toBe(true);
    expect(state.posts[0].likes).toEqual([10]);
  });

  it("likePost fulfilled user sudah ada", () => {
    const currentPost = {
      ...post,
      likes: [10],
    };

    const state = reducer(
      {
        ...initialState,
        posts: [currentPost],
      },
      likePostThunk.fulfilled(
        {
          message: "success",
          postId: 1,
          like: 1,
        } as any,
        "request",
        { postId: 1, like: 1 }
      )
    );

    expect(state.posts[0].likes).toEqual([10]);
  });

  it("likePost fulfilled post tidak ditemukan", () => {
    const state = reducer(
      initialState,
      likePostThunk.fulfilled(
        {
          message: "success",
          postId: 99,
          like: 1,
        } as any,
        "request",
        { postId: 99, like: 1 }
      )
    );

    expect(state.isPostLiked).toBe(true);
    expect(state.posts).toEqual([]);
  });

  it("likePost rejected", () => {
    const state = reducer(
      initialState,
      likePostThunk.rejected(
        new Error("error"),
        "request",
        { postId: 1, like: 1 },
        "error"
      )
    );

    expect(state.isPostLike).toBe(false);
    expect(state.isPostLiked).toBe(false);
    expect(state.error).toBe("error");
  });

  it("addComment pending", () => {
    const state = reducer(
      initialState,
      addCommentThunk.pending(
        "request",
        { postId: 1, comment: "test" }
      )
    );

    expect(state.isPostAddComment).toBe(true);
    expect(state.isPostAddedComment).toBe(false);
    expect(state.error).toBeNull();
  });

  it("addComment fulfilled", () => {
    const state = reducer(
      initialState,
      addCommentThunk.fulfilled(
        { message: "success" } as any,
        "request",
        { postId: 1, comment: "test" }
      )
    );

    expect(state.isPostAddComment).toBe(false);
    expect(state.isPostAddedComment).toBe(true);
    expect(state.error).toBeNull();
  });

  it("addComment rejected", () => {
    const state = reducer(
      initialState,
      addCommentThunk.rejected(
        new Error("error"),
        "request",
        { postId: 1, comment: "test" },
        "error"
      )
    );

    expect(state.isPostAddComment).toBe(false);
    expect(state.isPostAddedComment).toBe(false);
    expect(state.error).toBe("error");
  });

  it("deleteComment pending", () => {
    const state = reducer(
      initialState,
      deleteCommentThunk.pending("request", 1)
    );

    expect(state.isPostDeleteComment).toBe(true);
    expect(state.isPostDeletedComment).toBe(false);
    expect(state.error).toBeNull();
  });

  it("deleteComment fulfilled", () => {
    const state = reducer(
      initialState,
      deleteCommentThunk.fulfilled(
        { message: "success" } as any,
        "request",
        1
      )
    );

    expect(state.isPostDeleteComment).toBe(false);
    expect(state.isPostDeletedComment).toBe(true);
    expect(state.error).toBeNull();
  });

  it("deleteComment rejected", () => {
    const state = reducer(
      initialState,
      deleteCommentThunk.rejected(
        new Error("error"),
        "request",
        1,
        "error"
      )
    );

    expect(state.isPostDeleteComment).toBe(false);
    expect(state.isPostDeletedComment).toBe(false);
    expect(state.error).toBe("error");
  });

  it("deleteAllPosts pending", () => {
    const state = reducer(
      initialState,
      deleteAllPostsThunk.pending("request", undefined)
    );

    expect(state.isPostDeleteAll).toBe(true);
    expect(state.isPostDeletedAll).toBe(false);
    expect(state.error).toBeNull();
  });

  it("deleteAllPosts fulfilled", () => {
    const state = reducer(
      {
        ...initialState,
        posts: [post],
        post,
      },
      deleteAllPostsThunk.fulfilled(
        { message: "success" } as any,
        "request",
        undefined
      )
    );

    expect(state.isPostDeleteAll).toBe(false);
    expect(state.isPostDeletedAll).toBe(true);
    expect(state.posts).toEqual([]);
    expect(state.post).toBeNull();
    expect(state.error).toBeNull();
  });

  it("deleteAllPosts rejected", () => {
    const state = reducer(
      initialState,
      deleteAllPostsThunk.rejected(
        new Error("error"),
        "request",
        undefined,
        "error"
      )
    );

    expect(state.isPostDeleteAll).toBe(false);
    expect(state.isPostDeletedAll).toBe(false);
    expect(state.error).toBe("error");
  });
});

describe("Posts async thunks", () => {
  it("fetchPosts sukses", async () => {
    vi.mocked(getPosts).mockResolvedValue({
      data: { posts: [post] },
    } as any);

    await fetchPosts(true)(vi.fn(), vi.fn(), undefined);

    expect(getPosts).toHaveBeenCalledWith(true);
  });

  it("fetchPosts default false", async () => {
    vi.mocked(getPosts).mockResolvedValue({
      data: { posts: [post] },
    } as any);

    await fetchPosts()(vi.fn(), vi.fn(), undefined);

    expect(getPosts).toHaveBeenCalledWith(false);
  });

  it("fetchPost sukses", async () => {
    vi.mocked(getPost).mockResolvedValue({
      data: { post },
    } as any);

    await fetchPost(1)(vi.fn(), vi.fn(), undefined);

    expect(getPost).toHaveBeenCalledWith(1);
  });

  it("addPost sukses", async () => {
    vi.mocked(addPost).mockResolvedValue({
      message: "success",
    } as any);

    await addPostThunk({ description: "test" })(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(addPost).toHaveBeenCalledWith({
      description: "test",
    });
  });

  it("changePost sukses", async () => {
    vi.mocked(updatePost).mockResolvedValue({
      message: "success",
    } as any);

    await changePost({
      postId: 1,
      description: "updated",
    })(vi.fn(), vi.fn(), undefined);

    expect(updatePost).toHaveBeenCalledWith(1, {
      description: "updated",
    });
  });

  it("changePostCover sukses", async () => {
    const file = new File(["test"], "cover.jpg");

    vi.mocked(updatePostCover).mockResolvedValue({
      message: "success",
    } as any);

    await changePostCover({
      postId: 1,
      file,
    })(vi.fn(), vi.fn(), undefined);

    expect(updatePostCover).toHaveBeenCalledWith(1, file);
  });

  it("deletePost sukses", async () => {
    vi.mocked(deletePost).mockResolvedValue({
      message: "success",
    } as any);

    await deletePostThunk(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(deletePost).toHaveBeenCalledWith(1);
  });

  it("likePost sukses", async () => {
    vi.mocked(likePost).mockResolvedValue({
      message: "success",
    } as any);

    await likePostThunk({
      postId: 1,
      like: 1,
    })(vi.fn(), vi.fn(), undefined);

    expect(likePost).toHaveBeenCalledWith(1, {
      like: 1,
    });
  });

  it("addComment sukses", async () => {
    vi.mocked(addComment).mockResolvedValue({
      message: "success",
    } as any);

    await addCommentThunk({
      postId: 1,
      comment: "test",
    })(vi.fn(), vi.fn(), undefined);

    expect(addComment).toHaveBeenCalledWith(1, {
      comment: "test",
    });
  });

  it("deleteComment sukses", async () => {
    vi.mocked(deleteComment).mockResolvedValue({
      message: "success",
    } as any);

    await deleteCommentThunk(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(deleteComment).toHaveBeenCalledWith(1);
  });

  it("deleteAllPosts sukses", async () => {
    vi.mocked(deleteAllPosts).mockResolvedValue({
      message: "success",
    } as any);

    await deleteAllPostsThunk()(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(deleteAllPosts).toHaveBeenCalled();
  });
});

describe("Posts async thunks - Error", () => {
  it("fetchPosts Error", async () => {
    vi.mocked(getPosts).mockRejectedValue(
      new Error("fetch posts error")
    );

    const result = await fetchPosts(true)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe("fetch posts error");
  });

  it("fetchPosts bukan Error", async () => {
    vi.mocked(getPosts).mockRejectedValue("unknown");

    const result = await fetchPosts(true)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe(
      "Gagal mengambil data postingan."
    );
  });

  it("fetchPost Error", async () => {
    vi.mocked(getPost).mockRejectedValue(
      new Error("fetch post error")
    );

    const result = await fetchPost(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe("fetch post error");
  });

  it("fetchPost bukan Error", async () => {
    vi.mocked(getPost).mockRejectedValue("unknown");

    const result = await fetchPost(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe(
      "Gagal mengambil detail postingan."
    );
  });

  it("addPost Error", async () => {
    vi.mocked(addPost).mockRejectedValue(
      new Error("add post error")
    );

    const result = await addPostThunk({
      description: "test",
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe("add post error");
  });

  it("addPost bukan Error", async () => {
    vi.mocked(addPost).mockRejectedValue("unknown");

    const result = await addPostThunk({
      description: "test",
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe(
      "Gagal menambahkan postingan."
    );
  });

  it("changePost Error", async () => {
    vi.mocked(updatePost).mockRejectedValue(
      new Error("change post error")
    );

    const result = await changePost({
      postId: 1,
      description: "test",
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe("change post error");
  });

  it("changePost bukan Error", async () => {
    vi.mocked(updatePost).mockRejectedValue("unknown");

    const result = await changePost({
      postId: 1,
      description: "test",
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe(
      "Gagal mengubah postingan."
    );
  });

  it("changePostCover Error", async () => {
    const file = new File(["test"], "cover.jpg");

    vi.mocked(updatePostCover).mockRejectedValue(
      new Error("cover error")
    );

    const result = await changePostCover({
      postId: 1,
      file,
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe("cover error");
  });

  it("changePostCover bukan Error", async () => {
    const file = new File(["test"], "cover.jpg");

    vi.mocked(updatePostCover).mockRejectedValue(
      "unknown"
    );

    const result = await changePostCover({
      postId: 1,
      file,
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe(
      "Gagal mengubah cover postingan."
    );
  });

  it("deletePost Error", async () => {
    vi.mocked(deletePost).mockRejectedValue(
      new Error("delete post error")
    );

    const result = await deletePostThunk(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe("delete post error");
  });

  it("deletePost bukan Error", async () => {
    vi.mocked(deletePost).mockRejectedValue("unknown");

    const result = await deletePostThunk(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe(
      "Gagal menghapus postingan."
    );
  });

  it("likePost Error", async () => {
    vi.mocked(likePost).mockRejectedValue(
      new Error("like error")
    );

    const result = await likePostThunk({
      postId: 1,
      like: 1,
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe("like error");
  });

  it("likePost bukan Error", async () => {
    vi.mocked(likePost).mockRejectedValue("unknown");

    const result = await likePostThunk({
      postId: 1,
      like: 1,
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe(
      "Gagal mengubah like postingan."
    );
  });

  it("addComment Error", async () => {
    vi.mocked(addComment).mockRejectedValue(
      new Error("comment error")
    );

    const result = await addCommentThunk({
      postId: 1,
      comment: "test",
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe("comment error");
  });

  it("addComment bukan Error", async () => {
    vi.mocked(addComment).mockRejectedValue("unknown");

    const result = await addCommentThunk({
      postId: 1,
      comment: "test",
    })(vi.fn(), vi.fn(), undefined);

    expect(result.payload).toBe(
      "Gagal menambahkan komentar."
    );
  });

  it("deleteComment Error", async () => {
    vi.mocked(deleteComment).mockRejectedValue(
      new Error("delete comment error")
    );

    const result = await deleteCommentThunk(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe("delete comment error");
  });

  it("deleteComment bukan Error", async () => {
    vi.mocked(deleteComment).mockRejectedValue("unknown");

    const result = await deleteCommentThunk(1)(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe(
      "Gagal menghapus komentar."
    );
  });

  it("deleteAllPosts Error", async () => {
    vi.mocked(deleteAllPosts).mockRejectedValue(
      new Error("delete all error")
    );

    const result = await deleteAllPostsThunk()(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe("delete all error");
  });

  it("deleteAllPosts bukan Error", async () => {
    vi.mocked(deleteAllPosts).mockRejectedValue("unknown");

    const result = await deleteAllPostsThunk()(
      vi.fn(),
      vi.fn(),
      undefined
    );

    expect(result.payload).toBe(
      "Gagal menghapus semua postingan."
    );
  });
});