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
  it("menggunakan initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("fetchPosts pending", () => {
    const action = fetchPosts.pending("request");
    const state = reducer(initialState, action);

    expect(state.isPost).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchPosts fulfilled", () => {
    const action = fetchPosts.fulfilled([post], "request", false);
    const state = reducer(initialState, action);

    expect(state.isPost).toBe(false);
    expect(state.posts).toEqual([post]);
  });

  it("fetchPosts rejected", () => {
    const action = fetchPosts.rejected(
      new Error("error"),
      "request",
      false,
      "Gagal mengambil data"
    );
    const state = reducer(initialState, action);

    expect(state.isPost).toBe(false);
    expect(state.error).toBe("Gagal mengambil data");
  });

  it("fetchPost fulfilled", () => {
    const action = fetchPost.fulfilled(post, "request", 1);
    const state = reducer(initialState, action);

    expect(state.post).toEqual(post);
    expect(state.isPost).toBe(false);
  });

  it("addPost fulfilled", () => {
    const action = addPostThunk.fulfilled(
      { message: "success" } as any,
      "request",
      { description: "test" }
    );
    const state = reducer(initialState, action);

    expect(state.isPostAdd).toBe(false);
    expect(state.isPostAdded).toBe(true);
  });

  it("changePost fulfilled", () => {
    const action = changePost.fulfilled(
      { message: "success" } as any,
      "request",
      { postId: 1, description: "updated" }
    );
    const state = reducer(initialState, action);

    expect(state.isPostChange).toBe(false);
    expect(state.isPostChanged).toBe(true);
  });

  it("changePostCover fulfilled", () => {
    const file = new File(["test"], "cover.jpg", {
      type: "image/jpeg",
    });

    const action = changePostCover.fulfilled(
      { message: "success" } as any,
      "request",
      { postId: 1, file }
    );
    const state = reducer(initialState, action);

    expect(state.isPostChangeCover).toBe(false);
    expect(state.isPostChangedCover).toBe(true);
  });

  it("deletePost fulfilled", () => {
    const currentState = {
      ...initialState,
      posts: [post],
      post,
    };

    const action = deletePostThunk.fulfilled(
      { message: "success" } as any,
      "request",
      1
    );

    const state = reducer(currentState, action);

    expect(state.posts).toEqual([]);
    expect(state.post).toBeNull();
    expect(state.isPostDeleted).toBe(true);
  });

  it("likePost fulfilled", () => {
    const currentPost = {
      ...post,
      likes: [],
    };

    const currentState = {
      ...initialState,
      posts: [currentPost],
    };

    const action = likePostThunk.fulfilled(
      {
        message: "success",
        postId: 1,
        like: 1,
      } as any,
      "request",
      { postId: 1, like: 1 }
    );

    const state = reducer(currentState, action);

    expect(state.isPostLiked).toBe(true);
    expect(state.posts[0].likes).toContain(10);
  });

  it("addComment fulfilled", () => {
    const action = addCommentThunk.fulfilled(
      { message: "success" } as any,
      "request",
      { postId: 1, comment: "Komentar" }
    );

    const state = reducer(initialState, action);

    expect(state.isPostAddComment).toBe(false);
    expect(state.isPostAddedComment).toBe(true);
  });

  it("deleteComment fulfilled", () => {
    const action = deleteCommentThunk.fulfilled(
      { message: "success" } as any,
      "request",
      1
    );

    const state = reducer(initialState, action);

    expect(state.isPostDeleteComment).toBe(false);
    expect(state.isPostDeletedComment).toBe(true);
  });

  it("deleteAllPosts fulfilled", () => {
    const currentState = {
      ...initialState,
      posts: [post],
      post,
    };

    const action = deleteAllPostsThunk.fulfilled(
      { message: "success" } as any,
      "request",
      undefined
    );

    const state = reducer(currentState, action);

    expect(state.posts).toEqual([]);
    expect(state.post).toBeNull();
    expect(state.isPostDeletedAll).toBe(true);
  });

  it("handle semua rejected action", () => {
    const rejectedActions = [
      addPostThunk.rejected(
        new Error("error"),
        "1",
        { description: "test" },
        "error"
      ),
      changePost.rejected(
        new Error("error"),
        "2",
        { postId: 1, description: "test" },
        "error"
      ),
      changePostCover.rejected(
        new Error("error"),
        "3",
        {
          postId: 1,
          file: new File(["x"], "x.jpg"),
        },
        "error"
      ),
      deletePostThunk.rejected(
        new Error("error"),
        "4",
        1,
        "error"
      ),
      likePostThunk.rejected(
        new Error("error"),
        "5",
        { postId: 1, like: 1 },
        "error"
      ),
      addCommentThunk.rejected(
        new Error("error"),
        "6",
        { postId: 1, comment: "test" },
        "error"
      ),
      deleteCommentThunk.rejected(
        new Error("error"),
        "7",
        1,
        "error"
      ),
      deleteAllPostsThunk.rejected(
        new Error("error"),
        "8",
        undefined,
        "error"
      ),
    ];

    let state = initialState;

    for (const action of rejectedActions) {
      state = reducer(state, action);
      expect(state.error).toBe("error");
    }
  });

  it("fetchPost pending dan rejected", () => {
    let state = reducer(
      initialState,
      fetchPost.pending("request", 1)
    );

    expect(state.isPost).toBe(true);

    state = reducer(
      state,
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

  it("mengabaikan like jika post tidak ditemukan", () => {
    const action = likePostThunk.fulfilled(
      {
        message: "success",
        postId: 99,
        like: 1,
      } as any,
      "request",
      { postId: 99, like: 1 }
    );

    const state = reducer(initialState, action);

    expect(state.isPostLiked).toBe(true);
    expect(state.posts).toEqual([]);
  });

  it("tidak menambahkan user dua kali ketika sudah like", () => {
    const currentPost = {
      ...post,
      likes: [10],
    };

    const action = likePostThunk.fulfilled(
      {
        message: "success",
        postId: 1,
        like: 1,
      } as any,
      "request",
      { postId: 1, like: 1 }
    );

    const state = reducer(
      {
        ...initialState,
        posts: [currentPost],
      },
      action
    );

    expect(state.posts[0].likes).toEqual([10]);
  });
});

describe("Posts async thunks", () => {
  it("fetchPosts memanggil API", async () => {
    vi.mocked(getPosts).mockResolvedValue({
      data: { posts: [post] },
    } as any);

    const dispatch = vi.fn();
    const getState = vi.fn();

    await fetchPosts(true)(dispatch, getState, undefined);

    expect(getPosts).toHaveBeenCalledWith(true);
  });

  it("fetchPost memanggil API", async () => {
    vi.mocked(getPost).mockResolvedValue({
      data: { post },
    } as any);

    await fetchPost(1)(vi.fn(), vi.fn(), undefined);

    expect(getPost).toHaveBeenCalledWith(1);
  });

  it("addPost memanggil API", async () => {
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

  it("changePost memanggil API", async () => {
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

  it("changePostCover memanggil API", async () => {
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

  it("deletePost memanggil API", async () => {
    vi.mocked(deletePost).mockResolvedValue({
      message: "success",
    } as any);

    await deletePostThunk(1)(vi.fn(), vi.fn(), undefined);

    expect(deletePost).toHaveBeenCalledWith(1);
  });

  it("likePost memanggil API", async () => {
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

  it("addComment memanggil API", async () => {
    vi.mocked(addComment).mockResolvedValue({
      message: "success",
    } as any);

    await addCommentThunk({
      postId: 1,
      comment: "Komentar",
    })(vi.fn(), vi.fn(), undefined);

    expect(addComment).toHaveBeenCalledWith(1, {
      comment: "Komentar",
    });
  });

  it("deleteComment memanggil API", async () => {
    vi.mocked(deleteComment).mockResolvedValue({
      message: "success",
    } as any);

    await deleteCommentThunk(1)(vi.fn(), vi.fn(), undefined);

    expect(deleteComment).toHaveBeenCalledWith(1);
  });

  it("deleteAllPosts memanggil API", async () => {
    vi.mocked(deleteAllPosts).mockResolvedValue({
      message: "success",
    } as any);

    await deleteAllPostsThunk()(vi.fn(), vi.fn(), undefined);

    expect(deleteAllPosts).toHaveBeenCalled();
  });
});
