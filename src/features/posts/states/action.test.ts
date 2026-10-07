import { describe, expect, it } from "vitest";

import {
  GET_POSTS,
  GET_POST,
  ADD_POST,
  CHANGE_POST,
  CHANGE_POST_COVER,
  DELETE_POST,
  LIKE_POST,
  ADD_COMMENT,
  DELETE_COMMENT,
  DELETE_ALL_POSTS,
  getPostsAction,
  getPostAction,
  addPostAction,
  changePostAction,
  changePostCoverAction,
  deletePostAction,
  likePostAction,
  addCommentAction,
  deleteCommentAction,
  deleteAllPostsAction,
} from "./action";

describe("Posts Actions", () => {
  it("getPostsAction menggunakan default isMe false", () => {
    expect(getPostsAction()).toEqual({
      type: GET_POSTS,
      payload: false,
    });
  });

  it("getPostsAction menerima isMe true", () => {
    expect(getPostsAction(true)).toEqual({
      type: GET_POSTS,
      payload: true,
    });
  });

  it("getPostAction mengirim postId", () => {
    expect(getPostAction(10)).toEqual({
      type: GET_POST,
      payload: 10,
    });
  });

  it("addPostAction mengirim description", () => {
    const payload = {
      description: "Postingan baru",
    };

    expect(addPostAction(payload)).toEqual({
      type: ADD_POST,
      payload,
    });
  });

  it("changePostAction mengirim postId dan description", () => {
    const payload = {
      postId: 5,
      description: "Deskripsi yang diubah",
    };

    expect(changePostAction(payload)).toEqual({
      type: CHANGE_POST,
      payload,
    });
  });

  it("changePostCoverAction mengirim postId dan file", () => {
    const file = new File(
      ["cover image"],
      "cover.jpg",
      {
        type: "image/jpeg",
      }
    );

    const payload = {
      postId: 5,
      file,
    };

    expect(changePostCoverAction(payload)).toEqual({
      type: CHANGE_POST_COVER,
      payload,
    });
  });

  it("deletePostAction mengirim postId", () => {
    expect(deletePostAction(7)).toEqual({
      type: DELETE_POST,
      payload: 7,
    });
  });

  it("likePostAction mengirim postId dan like", () => {
    const payload = {
      postId: 7,
      like: 1 as 1 | 0,
    };

    expect(likePostAction(payload)).toEqual({
      type: LIKE_POST,
      payload,
    });
  });

  it("addCommentAction mengirim postId dan comment", () => {
    const payload = {
      postId: 7,
      comment: "Komentar baru",
    };

    expect(addCommentAction(payload)).toEqual({
      type: ADD_COMMENT,
      payload,
    });
  });

  it("deleteCommentAction mengirim postId", () => {
    expect(deleteCommentAction(8)).toEqual({
      type: DELETE_COMMENT,
      payload: 8,
    });
  });

  it("deleteAllPostsAction tidak memiliki payload", () => {
    expect(deleteAllPostsAction()).toEqual({
      type: DELETE_ALL_POSTS,
    });
  });
});