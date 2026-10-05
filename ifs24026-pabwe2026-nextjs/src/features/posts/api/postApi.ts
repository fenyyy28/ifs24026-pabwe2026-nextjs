import { apiFetch } from "@/helpers/apiHelper";

export interface PostAuthor {
  name: string;
  photo: string | null;
}

export interface PostComment {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  cover: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  author: PostAuthor;
  likes: number[];
  comments: PostComment[];
  my_comment?: PostComment | null;
}

export interface PostsResponse {
  status: string;
  message: string;
  data: {
    posts: Post[];
  };
}

export interface PostResponse {
  status: string;
  message: string;
  data: {
    post: Post;
  };
}

export interface AddPostResponse {
  status: string;
  message: string;
  data: {
    post_id: number;
  };
}

export interface BasicPostResponse {
  status: string;
  message: string;
}

export interface PostDescriptionRequest {
  description: string;
}

export interface LikeRequest {
  like: 1 | 0;
}

export interface CommentRequest {
  comment: string;
}

/**
 * Mengambil seluruh postingan.
 *
 * isMe = true akan mengirim is_me=1
 * untuk mengambil postingan milik pengguna aktif.
 */
export async function getPosts(
  isMe = false
): Promise<PostsResponse> {
  return apiFetch<PostsResponse>("/api/v1/posts", {
    method: "GET",
    query: isMe ? { is_me: 1 } : undefined,
  });
}

/**
 * Mengambil detail postingan berdasarkan ID.
 */
export async function getPost(
  postId: number
): Promise<PostResponse> {
  return apiFetch<PostResponse>(`/api/v1/posts/${postId}`, {
    method: "GET",
  });
}

/**
 * Menambahkan postingan baru.
 */
export async function addPost(
  data: PostDescriptionRequest
): Promise<AddPostResponse> {
  return apiFetch<AddPostResponse>("/api/v1/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Memperbarui deskripsi postingan.
 */
export async function updatePost(
  postId: number,
  data: PostDescriptionRequest
): Promise<BasicPostResponse> {
  return apiFetch<BasicPostResponse>(
    `/api/v1/posts/${postId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

/**
 * Mengunggah atau mengganti cover postingan.
 */
export async function updatePostCover(
  postId: number,
  file: File
): Promise<BasicPostResponse> {
  const formData = new FormData();

  formData.append("cover", file);

  return apiFetch<BasicPostResponse>(
    `/api/v1/posts/${postId}/cover`,
    {
      method: "POST",
      body: formData,
    }
  );
}

/**
 * Menghapus satu postingan.
 */
export async function deletePost(
  postId: number
): Promise<BasicPostResponse> {
  return apiFetch<BasicPostResponse>(
    `/api/v1/posts/${postId}`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Memberikan atau membatalkan like.
 *
 * like = 1 -> like
 * like = 0 -> unlike
 */
export async function likePost(
  postId: number,
  data: LikeRequest
): Promise<BasicPostResponse> {
  return apiFetch<BasicPostResponse>(
    `/api/v1/posts/${postId}/likes`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/**
 * Menambahkan komentar.
 */
export async function addComment(
  postId: number,
  data: CommentRequest
): Promise<BasicPostResponse> {
  return apiFetch<BasicPostResponse>(
    `/api/v1/posts/${postId}/comments`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

/**
 * Menghapus komentar pengguna pada postingan.
 */
export async function deleteComment(
  postId: number
): Promise<BasicPostResponse> {
  return apiFetch<BasicPostResponse>(
    `/api/v1/posts/${postId}/comments`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Menghapus seluruh postingan milik pengguna aktif.
 */
export async function deleteAllPosts(): Promise<BasicPostResponse> {
  return apiFetch<BasicPostResponse>("/api/v1/posts", {
    method: "DELETE",
  });
}