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

export async function getPosts(
  isMe = false
): Promise<PostsResponse> {
  return apiFetch<PostsResponse>("/api/v1/posts", {
    method: "GET",
    query: isMe ? { is_me: 1 } : undefined,
  });
}

export async function getPost(
  postId: number
): Promise<PostResponse> {
  return apiFetch<PostResponse>(`/api/v1/posts/${postId}`, {
    method: "GET",
  });
}

export async function addPost(
  data: PostDescriptionRequest
): Promise<AddPostResponse> {
  return apiFetch<AddPostResponse>("/api/v1/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

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

export async function deleteAllPosts(): Promise<BasicPostResponse> {
  return apiFetch<BasicPostResponse>("/api/v1/posts", {
    method: "DELETE",
  });
}