// @vitest-environment jsdom

import React from "react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  getPost: vi.fn(),
  updatePost: vi.fn(),
  updatePostCover: vi.fn(),
  deletePost: vi.fn(),
  likePost: vi.fn(),
  addComment: vi.fn(),
  deleteComment: vi.fn(),

  getMyProfile: vi.fn(),

  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),

  replace: vi.fn(),

  navigation: {
    postId: "1",
  },
}));

vi.mock("@/features/posts/api/postApi", () => ({
  getPost: mocks.getPost,
  updatePost: mocks.updatePost,
  updatePostCover: mocks.updatePostCover,
  deletePost: mocks.deletePost,
  likePost: mocks.likePost,
  addComment: mocks.addComment,
  deleteComment: mocks.deleteComment,
}));

vi.mock("@/features/users/api/userApi", () => ({
  getMyProfile: mocks.getMyProfile,
}));

vi.mock("@/helpers/toolsHelper", () => ({
  showConfirmDialog: mocks.showConfirmDialog,
  showErrorDialog: mocks.showErrorDialog,
  showSuccessDialog: mocks.showSuccessDialog,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({
    postId: mocks.navigation.postId,
  }),
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@/features/posts/layouts/PostLayout", () => ({
  default: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="post-layout">{children}</div>,
}));

import DetailPage from "./DetailPage";

/* =========================================================
   TEST DATA
========================================================= */

function createPost(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    user_id: 1,
    description: "Ini adalah postingan test.",
    cover: "https://example.com/cover.jpg",
    created_at: "2026-01-01T00:00:00.000Z",

    author: {
      name: "Feny",
      photo: "https://example.com/photo.jpg",
    },

    likes: [1],

    comments: [
      {
        id: 10,
        comment: "Komentar test.",
        created_at: "2026-01-02T00:00:00.000Z",
      },
    ],

    my_comment: true,

    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

/* =========================================================
   DEFAULT MOCK HELPERS
========================================================= */

function setDefaultMocks(
  post = createPost()
) {
  mocks.getPost.mockResolvedValue({
    data: {
      post,
    },
  });

  mocks.getMyProfile.mockResolvedValue({
    data: {
      user: {
        id: 1,
      },
    },
  });

  mocks.updatePost.mockResolvedValue({
    data: {},
  });

  mocks.updatePostCover.mockResolvedValue({
    data: {},
  });

  mocks.deletePost.mockResolvedValue({
    data: {},
  });

  mocks.likePost.mockResolvedValue({
    data: {},
  });

  mocks.addComment.mockResolvedValue({
    data: {},
  });

  mocks.deleteComment.mockResolvedValue({
    data: {},
  });

  mocks.showConfirmDialog.mockResolvedValue(true);
  mocks.showErrorDialog.mockResolvedValue(undefined);
  mocks.showSuccessDialog.mockResolvedValue(undefined);
}

/* =========================================================
   RENDER HELPERS
========================================================= */

async function renderReady(
  post = createPost()
) {
  setDefaultMocks(post);

  render(<DetailPage />);

  await screen.findByText(post.description);

  await waitFor(() => {
    expect(
      screen.queryByText("Memuat postingan...")
    ).not.toBeInTheDocument();
  });

  return post;
}

function getCoverInput() {
  const input = document.querySelector(
    'input[type="file"][accept="image/*"]'
  ) as HTMLInputElement | null;

  if (!input) {
    throw new Error("Input cover tidak ditemukan.");
  }

  return input;
}

/* =========================================================
   RESET
========================================================= */

beforeEach(() => {
  cleanup();

  vi.resetAllMocks();

  mocks.navigation.postId = "1";

  setDefaultMocks();
});

/* =========================================================
   TESTS
========================================================= */

describe("DetailPage", () => {
  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  it("menampilkan loading saat data masih dimuat", async () => {
    const profile = deferred<{
      data: {
        user: {
          id: number;
        };
      };
    }>();

    const post = deferred<{
      data: {
        post: ReturnType<typeof createPost>;
      };
    }>();

    mocks.getMyProfile.mockReturnValue(profile.promise);
    mocks.getPost.mockReturnValue(post.promise);

    render(<DetailPage />);

    expect(
      screen.getByText("Memuat postingan...")
    ).toBeInTheDocument();

    profile.resolve({
      data: {
        user: {
          id: 1,
        },
      },
    });

    post.resolve({
      data: {
        post: createPost(),
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText("Ini adalah postingan test.")
      ).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------
     BASIC DISPLAY
  ------------------------------------------------------- */

  it("menampilkan postingan setelah loading selesai", async () => {
    await renderReady();

    expect(
      screen.getByText("Ini adalah postingan test.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Feny")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Komentar")
    ).toBeInTheDocument();
  });

  it("menampilkan cover postingan", async () => {
    await renderReady();

    const image = screen.getByAltText(
      "Cover postingan"
    );

    expect(image).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg"
    );
  });

  it("menampilkan fallback ketika cover tidak tersedia", async () => {
    await renderReady(
      createPost({
        cover: null,
      })
    );

    expect(
      screen.getByText("Tidak ada cover")
    ).toBeInTheDocument();

    expect(
      screen.getByText("P")
    ).toBeInTheDocument();
  });

  it("menampilkan foto author", async () => {
    await renderReady();

    const image = screen.getByAltText("Feny");

    expect(image).toHaveAttribute(
      "src",
      "https://example.com/photo.jpg"
    );
  });

  it("menampilkan fallback author ketika foto tidak tersedia", async () => {
    await renderReady(
      createPost({
        author: {
          name: "Budi",
          photo: null,
        },
      })
    );

    expect(
      screen.getByText("B")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Budi")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------------
     OWNER
  ------------------------------------------------------- */

  it("menampilkan tombol pemilik postingan", async () => {
    await renderReady();

    expect(
      screen.getByRole("button", {
        name: "Ubah",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cover")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Hapus",
      })
    ).toBeInTheDocument();
  });

  it("tidak menampilkan tombol pemilik jika bukan pemilik", async () => {
    await renderReady(
      createPost({
        user_id: 99,
      })
    );

    expect(
      screen.queryByRole("button", {
        name: "Ubah",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Hapus",
      })
    ).not.toBeInTheDocument();
  });

  /* -------------------------------------------------------
     LIKE
  ------------------------------------------------------- */

  it("menampilkan status sudah disukai", async () => {
    await renderReady(
      createPost({
        likes: [1, 2],
      })
    );

    expect(
      screen.getByRole("button", {
        name: "♥ Disukai",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("2 suka")
    ).toBeInTheDocument();
  });

  it("menampilkan status belum disukai", async () => {
    await renderReady(
      createPost({
        likes: [],
      })
    );

    expect(
      screen.getByRole("button", {
        name: "♡ Suka",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 suka")
    ).toBeInTheDocument();
  });

  it("melakukan like pada postingan", async () => {
    await renderReady(
      createPost({
        likes: [],
      })
    );

    const callsBeforeAction =
      mocks.getPost.mock.calls.length;

    fireEvent.click(
      screen.getByRole("button", {
        name: "♡ Suka",
      })
    );

    await waitFor(() => {
      expect(
        mocks.likePost
      ).toHaveBeenCalledWith(
        1,
        {
          like: 1,
        }
      );
    });

    await waitFor(() => {
      expect(
        mocks.getPost.mock.calls.length
      ).toBeGreaterThan(callsBeforeAction);
    });
  });

  it("membatalkan like pada postingan", async () => {
    await renderReady();

    const callsBeforeAction =
      mocks.getPost.mock.calls.length;

    fireEvent.click(
      screen.getByRole("button", {
        name: "♥ Disukai",
      })
    );

    await waitFor(() => {
      expect(
        mocks.likePost
      ).toHaveBeenCalledWith(
        1,
        {
          like: 0,
        }
      );
    });

    await waitFor(() => {
      expect(
        mocks.getPost.mock.calls.length
      ).toBeGreaterThan(callsBeforeAction);
    });
  });

  it("menampilkan loading ketika like diproses", async () => {
    await renderReady();

    const action = deferred<unknown>();

    mocks.likePost.mockReturnValue(
      action.promise
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "♥ Disukai",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "♥ Disukai",
      })
    ).toBeDisabled();

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "♥ Disukai",
        })
      ).not.toBeDisabled();
    });
  });

  it("menangani error like", async () => {
    await renderReady(
      createPost({
        likes: [],
      })
    );

    mocks.likePost.mockRejectedValue(
      new Error("Like gagal")
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "♡ Suka",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Like gagal",
        "Like gagal"
      );
    });
  });

  it("menangani error like non Error", async () => {
    await renderReady(
      createPost({
        likes: [],
      })
    );

    mocks.likePost.mockRejectedValue(
      "error"
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "♡ Suka",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Like gagal",
        "Gagal memberikan like."
      );
    });
  });

  /* -------------------------------------------------------
     UPDATE POST
  ------------------------------------------------------- */

  it("membuka mode edit", async () => {
    await renderReady();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    expect(
      screen.getByDisplayValue(
        "Ini adalah postingan test."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Simpan",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Batal",
      })
    ).toBeInTheDocument();
  });

  it("membatalkan mode edit dan mengembalikan deskripsi", async () => {
    await renderReady();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    const textarea =
      screen.getByDisplayValue(
        "Ini adalah postingan test."
      );

    fireEvent.change(textarea, {
      target: {
        value: "Deskripsi baru",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Batal",
      })
    );

    expect(
      screen.getByText(
        "Ini adalah postingan test."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByDisplayValue(
        "Deskripsi baru"
      )
    ).not.toBeInTheDocument();
  });

  it("menolak update dengan deskripsi kosong", async () => {
    await renderReady();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    const textarea =
      screen.getByDisplayValue(
        "Ini adalah postingan test."
      );

    fireEvent.change(textarea, {
      target: {
        value: "   ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Deskripsi kosong",
        "Deskripsi postingan tidak boleh kosong."
      );
    });

    expect(
      mocks.updatePost
    ).not.toHaveBeenCalled();
  });

  it("berhasil mengubah postingan", async () => {
    await renderReady();

    const updatedPost = createPost({
      description: "Deskripsi sudah diperbarui.",
    });

    mocks.getPost.mockResolvedValue({
      data: {
        post: updatedPost,
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    const textarea =
      screen.getByDisplayValue(
        "Ini adalah postingan test."
      );

    fireEvent.change(textarea, {
      target: {
        value: "Deskripsi sudah diperbarui.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan",
      })
    );

    await waitFor(() => {
      expect(
        mocks.updatePost
      ).toHaveBeenCalledWith(
        1,
        {
          description:
            "Deskripsi sudah diperbarui.",
        }
      );
    });

    await waitFor(() => {
      expect(
        mocks.showSuccessDialog
      ).toHaveBeenCalledWith(
        "Berhasil",
        "Postingan berhasil diperbarui."
      );
    });

    expect(
      screen.getByText(
        "Deskripsi sudah diperbarui."
      )
    ).toBeInTheDocument();
  });

  it("menampilkan loading ketika update diproses", async () => {
    await renderReady();

    const action = deferred<unknown>();

    mocks.updatePost.mockReturnValue(
      action.promise
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Menyimpan...",
      })
    ).toBeDisabled();

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: "Menyimpan...",
        })
      ).not.toBeInTheDocument();
    });
  });

  it("menangani error update", async () => {
    await renderReady();

    mocks.updatePost.mockRejectedValue(
      new Error("Update gagal")
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    fireEvent.change(
      screen.getByDisplayValue(
        "Ini adalah postingan test."
      ),
      {
        target: {
          value: "Deskripsi baru",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal memperbarui",
        "Update gagal"
      );
    });
  });

  it("menangani error update non Error", async () => {
    await renderReady();

    mocks.updatePost.mockRejectedValue(
      "error"
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    fireEvent.change(
      screen.getByDisplayValue(
        "Ini adalah postingan test."
      ),
      {
        target: {
          value: "Deskripsi baru",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal memperbarui",
        "Postingan gagal diperbarui."
      );
    });
  });

  /* -------------------------------------------------------
     COVER
  ------------------------------------------------------- */

  it("mengubah cover dengan file gambar", async () => {
    await renderReady();

    const input = getCoverInput();

    const file = new File(
      ["image"],
      "cover.png",
      {
        type: "image/png",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(
        mocks.updatePostCover
      ).toHaveBeenCalledWith(
        1,
        file
      );
    });

    await waitFor(() => {
      expect(
        mocks.showSuccessDialog
      ).toHaveBeenCalledWith(
        "Berhasil",
        "Cover postingan berhasil diperbarui."
      );
    });
  });

  it("menampilkan loading ketika cover diubah", async () => {
    await renderReady();

    const action = deferred<unknown>();

    mocks.updatePostCover.mockReturnValue(
      action.promise
    );

    const input = getCoverInput();

    const file = new File(
      ["image"],
      "cover.png",
      {
        type: "image/png",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByText("Mengubah...")
    ).toBeInTheDocument();

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.getByText("Cover")
      ).toBeInTheDocument();
    });
  });

  it("menolak file cover bukan gambar", async () => {
    await renderReady();

    const input = getCoverInput();

    const file = new File(
      ["text"],
      "file.txt",
      {
        type: "text/plain",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "File tidak valid",
        "Silakan pilih file gambar."
      );
    });

    expect(
      mocks.updatePostCover
    ).not.toHaveBeenCalled();
  });

  it("menangani error cover", async () => {
    await renderReady();

    mocks.updatePostCover.mockRejectedValue(
      new Error("Cover gagal")
    );

    const input = getCoverInput();

    const file = new File(
      ["image"],
      "cover.png",
      {
        type: "image/png",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal mengubah cover",
        "Cover gagal"
      );
    });
  });

  /* -------------------------------------------------------
     DELETE POST
  ------------------------------------------------------- */

  it("menghapus postingan setelah konfirmasi", async () => {
    await renderReady();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showConfirmDialog
      ).toHaveBeenCalledWith(
        "Hapus postingan?",
        "Postingan akan dihapus secara permanen."
      );
    });

    await waitFor(() => {
      expect(
        mocks.deletePost
      ).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(
        mocks.showSuccessDialog
      ).toHaveBeenCalledWith(
        "Berhasil",
        "Postingan berhasil dihapus."
      );
    });

    expect(
      mocks.replace
    ).toHaveBeenCalledWith("/");
  });

  it("tidak menghapus postingan jika konfirmasi ditolak", async () => {
    await renderReady();

    mocks.showConfirmDialog.mockResolvedValue(
      false
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showConfirmDialog
      ).toHaveBeenCalled();
    });

    expect(
      mocks.deletePost
    ).not.toHaveBeenCalled();
  });

  it("menampilkan loading ketika postingan dihapus", async () => {
    await renderReady();

    const action = deferred<unknown>();

    mocks.deletePost.mockReturnValue(
      action.promise
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Menghapus...",
        })
      ).toBeDisabled();
    });

    action.resolve({});

    await waitFor(() => {
      expect(
        mocks.replace
      ).toHaveBeenCalledWith("/");
    });
  });

  it("menangani error hapus postingan", async () => {
    await renderReady();

    mocks.deletePost.mockRejectedValue(
      new Error("Delete gagal")
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal menghapus",
        "Delete gagal"
      );
    });
  });

  /* -------------------------------------------------------
     COMMENTS DISPLAY
  ------------------------------------------------------- */

  it("menampilkan komentar yang tersedia", async () => {
    await renderReady();

    expect(
      screen.getByText("Komentar test.")
    ).toBeInTheDocument();
  });

  it("menampilkan pesan ketika belum ada komentar", async () => {
    await renderReady(
      createPost({
        comments: [],
      })
    );

    expect(
      screen.getByText("Belum ada komentar.")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------------
     ADD COMMENT
  ------------------------------------------------------- */

  it("mengirim komentar", async () => {
    await renderReady();

    const callsBeforeAction =
      mocks.getPost.mock.calls.length;

    const textarea =
      screen.getByPlaceholderText(
        "Tulis komentar..."
      );

    fireEvent.change(textarea, {
      target: {
        value: "Komentar baru",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Kirim Komentar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.addComment
      ).toHaveBeenCalledWith(
        1,
        {
          comment: "Komentar baru",
        }
      );
    });

    await waitFor(() => {
      expect(
        mocks.getPost.mock.calls.length
      ).toBeGreaterThan(callsBeforeAction);
    });

    await waitFor(() => {
      expect(
        mocks.showSuccessDialog
      ).toHaveBeenCalledWith(
        "Komentar berhasil",
        "Komentar berhasil ditambahkan."
      );
    });
  });

  it("menolak komentar kosong", async () => {
    await renderReady();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Kirim Komentar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Komentar kosong",
        "Silakan tulis komentar terlebih dahulu."
      );
    });

    expect(
      mocks.addComment
    ).not.toHaveBeenCalled();
  });

  it("menampilkan loading ketika komentar dikirim", async () => {
    await renderReady();

    const action = deferred<unknown>();

    mocks.addComment.mockReturnValue(
      action.promise
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Tulis komentar..."
      ),
      {
        target: {
          value: "Komentar loading",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Kirim Komentar",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Mengirim...",
      })
    ).toBeDisabled();

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Kirim Komentar",
        })
      ).not.toBeDisabled();
    });
  });

  it("menangani error komentar", async () => {
    await renderReady();

    mocks.addComment.mockRejectedValue(
      new Error("Komentar gagal")
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Tulis komentar..."
      ),
      {
        target: {
          value: "Komentar error",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Kirim Komentar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Komentar gagal",
        "Komentar gagal"
      );
    });
  });

  /* -------------------------------------------------------
     DELETE COMMENT
  ------------------------------------------------------- */

  it("menghapus komentar sendiri", async () => {
    await renderReady();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus komentar saya",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showConfirmDialog
      ).toHaveBeenCalledWith(
        "Hapus komentar?",
        "Komentar kamu akan dihapus."
      );
    });

    await waitFor(() => {
      expect(
        mocks.deleteComment
      ).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(
        mocks.showSuccessDialog
      ).toHaveBeenCalledWith(
        "Berhasil",
        "Komentar berhasil dihapus."
      );
    });
  });

  it("tidak menghapus komentar jika konfirmasi ditolak", async () => {
    await renderReady();

    mocks.showConfirmDialog.mockResolvedValue(
      false
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus komentar saya",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showConfirmDialog
      ).toHaveBeenCalled();
    });

    expect(
      mocks.deleteComment
    ).not.toHaveBeenCalled();
  });

  it("menampilkan loading ketika komentar dihapus", async () => {
    await renderReady();

    const action = deferred<unknown>();

    mocks.deleteComment.mockReturnValue(
      action.promise
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus komentar saya",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Menghapus...",
        })
      ).toBeDisabled();
    });

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Hapus komentar saya",
        })
      ).not.toBeDisabled();
    });
  });

  it("menangani error hapus komentar", async () => {
    await renderReady();

    mocks.deleteComment.mockRejectedValue(
      new Error("Komentar delete gagal")
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hapus komentar saya",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal menghapus komentar",
        "Komentar delete gagal"
      );
    });
  });

  it("menampilkan komentar saya hanya jika tersedia", async () => {
    await renderReady(
      createPost({
        my_comment: false,
      })
    );

    expect(
      screen.queryByRole("button", {
        name: "Hapus komentar saya",
      })
    ).not.toBeInTheDocument();
  });

  /* -------------------------------------------------------
     INITIAL ERROR
  ------------------------------------------------------- */

  it("menangani post yang gagal dimuat", async () => {
    mocks.getPost.mockRejectedValue(
      new Error("Post gagal dimuat")
    );

    render(<DetailPage />);

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal memuat postingan",
        "Post gagal dimuat"
      );
    });

    expect(
      mocks.replace
    ).toHaveBeenCalledWith("/");
  });

  it("menangani post yang gagal dimuat dengan error non Error", async () => {
    mocks.getPost.mockRejectedValue(
      "error"
    );

    render(<DetailPage />);

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal memuat postingan",
        "Postingan tidak dapat dimuat."
      );
    });

    expect(
      mocks.replace
    ).toHaveBeenCalledWith("/");
  });

  it("menangani profile yang gagal dimuat", async () => {
    mocks.getMyProfile.mockRejectedValue(
      new Error("Profile gagal")
    );

    render(<DetailPage />);

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal memuat akun",
        "Profile gagal"
      );
    });
  });

  it("menangani profile yang gagal dengan error non Error", async () => {
    mocks.getMyProfile.mockRejectedValue(
      "error"
    );

    render(<DetailPage />);

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal memuat akun",
        "Data akun tidak dapat dimuat."
      );
    });
  });

  /* -------------------------------------------------------
     INVALID ID
  ------------------------------------------------------- */

  it("menangani postId tidak valid", async () => {
    mocks.navigation.postId = "abc";

    render(<DetailPage />);

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Postingan tidak ditemukan",
        "ID postingan tidak valid."
      );
    });

    expect(
      mocks.replace
    ).toHaveBeenCalledWith("/");
  });

  /* -------------------------------------------------------
     REFRESH ERROR
  ------------------------------------------------------- */

  it("mengabaikan refresh post yang gagal setelah komentar", async () => {
    await renderReady();

    mocks.getPost.mockRejectedValueOnce(
      new Error("Refresh gagal")
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Tulis komentar..."
      ),
      {
        target: {
          value: "Komentar refresh",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Kirim Komentar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.addComment
      ).toHaveBeenCalledWith(
        1,
        {
          comment: "Komentar refresh",
        }
      );
    });

    await waitFor(() => {
      expect(
        mocks.showSuccessDialog
      ).toHaveBeenCalledWith(
        "Komentar berhasil",
        "Komentar berhasil ditambahkan."
      );
    });
  });

  it("tetap menyelesaikan update jika refresh gagal", async () => {
    await renderReady();

    mocks.getPost.mockRejectedValueOnce(
      new Error("Refresh gagal")
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ubah",
      })
    );

    fireEvent.change(
      screen.getByDisplayValue(
        "Ini adalah postingan test."
      ),
      {
        target: {
          value: "Update refresh gagal",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan",
      })
    );

    await waitFor(() => {
      expect(
        mocks.updatePost
      ).toHaveBeenCalledWith(
        1,
        {
          description:
            "Update refresh gagal",
        }
      );
    });

    await waitFor(() => {
      expect(
        mocks.showSuccessDialog
      ).toHaveBeenCalledWith(
        "Berhasil",
        "Postingan berhasil diperbarui."
      );
    });
  });
});