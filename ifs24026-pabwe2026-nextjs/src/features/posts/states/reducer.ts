import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  addComment as addCommentApi,
  addPost,
  deleteAllPosts,
  deleteComment,
  deletePost,
  getPost,
  getPosts,
  likePost,
  updatePost,
  updatePostCover,
  type Post,
} from "@/features/posts/api/postApi";

interface PostsState {
  posts: Post[];
  post: Post | null;

  isPost: boolean;

  isPostAdd: boolean;
  isPostAdded: boolean;

  isPostChange: boolean;
  isPostChanged: boolean;

  isPostChangeCover: boolean;
  isPostChangedCover: boolean;

  isPostDelete: boolean;
  isPostDeleted: boolean;

  isPostLike: boolean;
  isPostLiked: boolean;

  isPostAddComment: boolean;
  isPostAddedComment: boolean;

  isPostDeleteComment: boolean;
  isPostDeletedComment: boolean;

  isPostDeleteAll: boolean;
  isPostDeletedAll: boolean;

  error: string | null;
}

const initialState: PostsState = {
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

/* =========================
   GET POSTS
========================= */

export const fetchPosts = createAsyncThunk(
  "posts/getPosts",
  async (isMe: boolean = false, { rejectWithValue }) => {
    try {
      const response = await getPosts(isMe);

      return response.data.posts;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data postingan."
      );
    }
  }
);

/* =========================
   GET POST DETAIL
========================= */

export const fetchPost = createAsyncThunk(
  "posts/getPost",
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await getPost(postId);

      return response.data.post;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail postingan."
      );
    }
  }
);

/* =========================
   ADD POST
========================= */

export const addPostThunk = createAsyncThunk(
  "posts/addPost",
  async (
    payload: {
      description: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await addPost(payload);

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan postingan."
      );
    }
  }
);

/* =========================
   CHANGE POST
========================= */

export const changePost = createAsyncThunk(
  "posts/changePost",
  async (
    payload: {
      postId: number;
      description: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updatePost(
        payload.postId,
        {
          description: payload.description,
        }
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengubah postingan."
      );
    }
  }
);

/* =========================
   CHANGE POST COVER
========================= */

export const changePostCover = createAsyncThunk(
  "posts/changePostCover",
  async (
    payload: {
      postId: number;
      file: File;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updatePostCover(
        payload.postId,
        payload.file
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengubah cover postingan."
      );
    }
  }
);

/* =========================
   DELETE POST
========================= */

export const deletePostThunk = createAsyncThunk(
  "posts/deletePost",
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await deletePost(postId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal menghapus postingan."
      );
    }
  }
);

/* =========================
   LIKE POST
========================= */

export const likePostThunk = createAsyncThunk(
  "posts/likePost",
  async (
    payload: {
      postId: number;
      like: 1 | 0;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await likePost(
        payload.postId,
        {
          like: payload.like,
        }
      );

      return {
        ...response,
        postId: payload.postId,
        like: payload.like,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal mengubah like postingan."
      );
    }
  }
);

/* =========================
   ADD COMMENT
========================= */

export const addCommentThunk = createAsyncThunk(
  "posts/addComment",
  async (
    payload: {
      postId: number;
      comment: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await addCommentApi(
        payload.postId,
        {
          comment: payload.comment,
        }
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan komentar."
      );
    }
  }
);

/* =========================
   DELETE COMMENT
========================= */

export const deleteCommentThunk = createAsyncThunk(
  "posts/deleteComment",
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await deleteComment(postId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal menghapus komentar."
      );
    }
  }
);

/* =========================
   DELETE ALL POSTS
========================= */

export const deleteAllPostsThunk = createAsyncThunk(
  "posts/deleteAllPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deleteAllPosts();

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Gagal menghapus semua postingan."
      );
    }
  }
);

/* =========================
   SLICE
========================= */

const postsSlice = createSlice({
  name: "posts",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* GET POSTS */
      .addCase(fetchPosts.pending, (state) => {
        state.isPost = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isPost = false;
        state.posts = action.payload;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isPost = false;
        state.error = action.payload as string;
      })

      /* GET POST */
      .addCase(fetchPost.pending, (state) => {
        state.isPost = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.isPost = false;
        state.post = action.payload;
        state.error = null;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isPost = false;
        state.error = action.payload as string;
      })

      /* ADD POST */
      .addCase(addPostThunk.pending, (state) => {
        state.isPostAdd = true;
        state.isPostAdded = false;
        state.error = null;
      })
      .addCase(addPostThunk.fulfilled, (state) => {
        state.isPostAdd = false;
        state.isPostAdded = true;
        state.error = null;
      })
      .addCase(addPostThunk.rejected, (state, action) => {
        state.isPostAdd = false;
        state.isPostAdded = false;
        state.error = action.payload as string;
      })

      /* CHANGE POST */
      .addCase(changePost.pending, (state) => {
        state.isPostChange = true;
        state.isPostChanged = false;
        state.error = null;
      })
      .addCase(changePost.fulfilled, (state) => {
        state.isPostChange = false;
        state.isPostChanged = true;
        state.error = null;
      })
      .addCase(changePost.rejected, (state, action) => {
        state.isPostChange = false;
        state.isPostChanged = false;
        state.error = action.payload as string;
      })

      /* CHANGE COVER */
      .addCase(changePostCover.pending, (state) => {
        state.isPostChangeCover = true;
        state.isPostChangedCover = false;
        state.error = null;
      })
      .addCase(changePostCover.fulfilled, (state) => {
        state.isPostChangeCover = false;
        state.isPostChangedCover = true;
        state.error = null;
      })
      .addCase(changePostCover.rejected, (state, action) => {
        state.isPostChangeCover = false;
        state.isPostChangedCover = false;
        state.error = action.payload as string;
      })

      /* DELETE POST */
      .addCase(deletePostThunk.pending, (state) => {
        state.isPostDelete = true;
        state.isPostDeleted = false;
        state.error = null;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.isPostDelete = false;
        state.isPostDeleted = true;
        state.posts = state.posts.filter(
          (post) => post.id !== action.meta.arg
        );

        if (state.post?.id === action.meta.arg) {
          state.post = null;
        }

        state.error = null;
      })
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.isPostDelete = false;
        state.isPostDeleted = false;
        state.error = action.payload as string;
      })

      /* LIKE POST */
      .addCase(likePostThunk.pending, (state) => {
        state.isPostLike = true;
        state.isPostLiked = false;
        state.error = null;
      })
      .addCase(likePostThunk.fulfilled, (state, action) => {
        state.isPostLike = false;
        state.isPostLiked = true;

        const { postId, like } = action.payload;

        const post = state.posts.find(
          (item) => item.id === postId
        );

        if (post) {
          if (like === 1) {
            if (!post.likes.includes(post.user_id)) {
              post.likes.push(post.user_id);
            }
          }
        }

        state.error = null;
      })
      .addCase(likePostThunk.rejected, (state, action) => {
        state.isPostLike = false;
        state.isPostLiked = false;
        state.error = action.payload as string;
      })

      /* ADD COMMENT */
      .addCase(addCommentThunk.pending, (state) => {
        state.isPostAddComment = true;
        state.isPostAddedComment = false;
        state.error = null;
      })
      .addCase(addCommentThunk.fulfilled, (state) => {
        state.isPostAddComment = false;
        state.isPostAddedComment = true;
        state.error = null;
      })
      .addCase(addCommentThunk.rejected, (state, action) => {
        state.isPostAddComment = false;
        state.isPostAddedComment = false;
        state.error = action.payload as string;
      })

      /* DELETE COMMENT */
      .addCase(deleteCommentThunk.pending, (state) => {
        state.isPostDeleteComment = true;
        state.isPostDeletedComment = false;
        state.error = null;
      })
      .addCase(deleteCommentThunk.fulfilled, (state) => {
        state.isPostDeleteComment = false;
        state.isPostDeletedComment = true;
        state.error = null;
      })
      .addCase(deleteCommentThunk.rejected, (state, action) => {
        state.isPostDeleteComment = false;
        state.isPostDeletedComment = false;
        state.error = action.payload as string;
      })

      /* DELETE ALL POSTS */
      .addCase(deleteAllPostsThunk.pending, (state) => {
        state.isPostDeleteAll = true;
        state.isPostDeletedAll = false;
        state.error = null;
      })
      .addCase(deleteAllPostsThunk.fulfilled, (state) => {
        state.isPostDeleteAll = false;
        state.isPostDeletedAll = true;
        state.posts = [];
        state.post = null;
        state.error = null;
      })
      .addCase(deleteAllPostsThunk.rejected, (state, action) => {
        state.isPostDeleteAll = false;
        state.isPostDeletedAll = false;
        state.error = action.payload as string;
      });
  },
});

export default postsSlice.reducer;