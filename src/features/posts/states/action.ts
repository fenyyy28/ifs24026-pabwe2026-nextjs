export const GET_POSTS = "posts/getPosts";
export const GET_POST = "posts/getPost";

export const ADD_POST = "posts/addPost";
export const CHANGE_POST = "posts/changePost";
export const CHANGE_POST_COVER = "posts/changePostCover";

export const DELETE_POST = "posts/deletePost";
export const LIKE_POST = "posts/likePost";

export const ADD_COMMENT = "posts/addComment";
export const DELETE_COMMENT = "posts/deleteComment";

export const DELETE_ALL_POSTS = "posts/deleteAllPosts";

export const getPostsAction = (isMe = false) => ({
  type: GET_POSTS,
  payload: isMe,
});

export const getPostAction = (postId: number) => ({
  type: GET_POST,
  payload: postId,
});

export const addPostAction = (payload: {
  description: string;
}) => ({
  type: ADD_POST,
  payload,
});

export const changePostAction = (payload: {
  postId: number;
  description: string;
}) => ({
  type: CHANGE_POST,
  payload,
});

export const changePostCoverAction = (payload: {
  postId: number;
  file: File;
}) => ({
  type: CHANGE_POST_COVER,
  payload,
});

export const deletePostAction = (postId: number) => ({
  type: DELETE_POST,
  payload: postId,
});

export const likePostAction = (payload: {
  postId: number;
  like: 1 | 0;
}) => ({
  type: LIKE_POST,
  payload,
});

export const addCommentAction = (payload: {
  postId: number;
  comment: string;
}) => ({
  type: ADD_COMMENT,
  payload,
});

export const deleteCommentAction = (postId: number) => ({
  type: DELETE_COMMENT,
  payload: postId,
});

export const deleteAllPostsAction = () => ({
  type: DELETE_ALL_POSTS,
});