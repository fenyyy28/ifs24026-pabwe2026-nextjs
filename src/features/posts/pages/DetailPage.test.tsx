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

  router: {
    replace: vi.fn(),
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

vi.mock("@/lib/dialog", () => ({
  showConfirmDialog: mocks.showConfirmDialog,
  showErrorDialog: mocks.showErrorDialog,
  showSuccessDialog: mocks.showSuccessDialog,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({
    postId: mocks.navigation.postId,
  }),
  useRouter: () => mocks.router,
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
  }) => (
    <div data-testid="post-layout">
      {children}
    </div>
  ),
}));

import DetailPage from "./DetailPage";

/* =========================================================
   TEST DATA
========================================================= */

function createPost(
  overrides: Record<string, unknown> = {}
) {
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
   DEFAULT MOCKS
========================================================= */

function setDefaultMocks(
  post = createPost(),
  userId = 1
) {
  mocks.getPost.mockResolvedValue({
    data: {
      post,
    },
  });

  mocks.getMyProfile.mockResolvedValue({
    data: {
      user: {
        id: userId,
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

  mocks.showErrorDialog.mockResolvedValue(
    undefined
  );

  mocks.showSuccessDialog.mockResolvedValue(
    undefined
  );
}

/* =========================================================
   RENDER HELPERS
========================================================= */

async function renderReady(
  post = createPost(),
  userId = 1
) {
  setDefaultMocks(post, userId);

  render(<DetailPage />);

  await waitFor(() => {
    expect(
      screen.queryByText("Memuat postingan...")
    ).not.toBeInTheDocument();
  });

  await screen.findByText(post.description);

  await screen.findByRole("heading", {
    name: "Komentar",
  });

  return post;
}

async function getOwnerEditButton() {
  return screen.findByRole("button", {
    name: "Ubah",
  });
}

async function getCommentInput() {
  return screen.findByPlaceholderText(
    "Tulis komentar..."
  );
}

function getCoverInput() {
  const input = document.querySelector(
    'input[type="file"][accept="image/*"]'
  ) as HTMLInputElement | null;

  if (!input) {
    throw new Error(
      "Input cover tidak ditemukan."
    );
  }

  return input;
}

/* =========================================================
   CONTROLLED TEXTAREA HELPER
========================================================= */

async function changeEditDescription(
  value: string
) {
  const textarea =
    document.querySelector(
      'textarea[rows="6"]'
    ) as HTMLTextAreaElement | null;

  if (!textarea) {
    throw new Error(
      "Textarea deskripsi tidak ditemukan."
    );
  }

  fireEvent.change(textarea, {
    target: {
      value,
    },
  });

  await waitFor(() => {
    expect(textarea).toHaveValue(value);
  });

  return textarea;
}

/* =========================================================
   RESET
========================================================= */

beforeEach(() => {
  cleanup();

  vi.resetAllMocks();

  mocks.navigation.postId = "1";

  mocks.router.replace = mocks.replace;

  setDefaultMocks();
});

/* =========================================================
   TESTS
========================================================= */

describe("DetailPage", () => {
  /* =======================================================
     LOADING
  ======================================================= */

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
        post: ReturnType<
          typeof createPost
        >;
      };
    }>();

    mocks.getMyProfile.mockReturnValue(
      profile.promise
    );

    mocks.getPost.mockReturnValue(
      post.promise
    );

    render(<DetailPage />);

    expect(
      screen.getByText(
        "Memuat postingan..."
      )
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
        screen.getByText(
          "Ini adalah postingan test."
        )
      ).toBeInTheDocument();
    });
  });

  /* =======================================================
     BASIC DISPLAY
  ======================================================= */

  it("menampilkan postingan setelah loading selesai", async () => {
    await renderReady();

    expect(
      screen.getByText(
        "Ini adalah postingan test."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Feny")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Komentar",
      })
    ).toBeInTheDocument();
  });

  it("menampilkan cover postingan", async () => {
    await renderReady();

    const image =
      screen.getByAltText(
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
    screen.getByText(
      "Tidak ada cover"
    )
  ).toBeInTheDocument();
});
  it("menampilkan foto author", async () => {
    await renderReady();

    const image =
      screen.getByAltText("Feny");

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

  it("menampilkan fallback nama pengguna ketika author name kosong", async () => {
  await renderReady(
    createPost({
      author: {
        name: "",
        photo: null,
      },
    })
  );

  expect(
    screen.getByText("P")
  ).toBeInTheDocument();

  expect(
    screen.getByText("Pengguna")
  ).toBeInTheDocument();
});
  it("menampilkan tombol pemilik postingan", async () => {
    await renderReady();

    expect(
      await getOwnerEditButton()
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

  /* =======================================================
     LIKE
  ======================================================= */

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

  it("menampilkan status belum disukai ketika likes tidak tersedia", async () => {
    await renderReady(
      createPost({
        likes: undefined,
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

  it("menampilkan status belum disukai ketika current user berbeda", async () => {
    await renderReady(
      createPost({
        likes: [1],
      }),
      99
    );

    expect(
      screen.getByRole("button", {
        name: "♡ Suka",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 suka")
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

    const button =
      await screen.findByRole(
        "button",
        {
          name: "♡ Suka",
        }
      );

    fireEvent.click(button);

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
      ).toBeGreaterThan(
        callsBeforeAction
      );
    });
  });

  it("membatalkan like pada postingan", async () => {
    await renderReady();

    const callsBeforeAction =
      mocks.getPost.mock.calls.length;

    const button =
      await screen.findByRole(
        "button",
        {
          name: "♥ Disukai",
        }
      );

    fireEvent.click(button);

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
      ).toBeGreaterThan(
        callsBeforeAction
      );
    });
  });

  it("menampilkan loading ketika like diproses", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

    mocks.likePost.mockReturnValue(
      action.promise
    );

    const button =
      await screen.findByRole(
        "button",
        {
          name: "♥ Disukai",
        }
      );

    fireEvent.click(button);

    await waitFor(() => {
  expect(
    screen.getByRole("button", {
      name: "Memproses...",
    })
  ).toBeDisabled();
});

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "♥ Disukai",
        })
      ).not.toBeDisabled();
    });
  });

  it("mengabaikan klik like kedua ketika proses pertama masih berjalan", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

    mocks.likePost.mockReturnValue(
      action.promise
    );

    const button =
      await screen.findByRole(
        "button",
        {
          name: "♥ Disukai",
        }
      );

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    button.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
      })
    );

    expect(
      mocks.likePost
    ).toHaveBeenCalledTimes(1);

    action.resolve({});

    await waitFor(() => {
      expect(button).not.toBeDisabled();
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

    const button =
      await screen.findByRole(
        "button",
        {
          name: "♡ Suka",
        }
      );

    fireEvent.click(button);

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

    const button =
      await screen.findByRole(
        "button",
        {
          name: "♡ Suka",
        }
      );

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Like gagal",
        "Gagal memberikan like."
      );
    });
  });

  /* =======================================================
     EDIT
  ======================================================= */

  it("membuka mode edit", async () => {
    await renderReady();

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    const textarea =
      await screen.findByDisplayValue(
        "Ini adalah postingan test."
      );

    expect(textarea).toBeInTheDocument();

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

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    await screen.findByDisplayValue(
      "Ini adalah postingan test."
    );

    await changeEditDescription(
      "Deskripsi baru"
    );

    const cancelButton =
      await screen.findByRole(
        "button",
        {
          name: "Batal",
        }
      );

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Ini adalah postingan test."
        )
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByDisplayValue(
        "Deskripsi baru"
      )
    ).not.toBeInTheDocument();
  });

  it("menolak update dengan deskripsi kosong", async () => {
    await renderReady();

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    await screen.findByDisplayValue(
      "Ini adalah postingan test."
    );

    await changeEditDescription("   ");

    const saveButton =
      await screen.findByRole(
        "button",
        {
          name: "Simpan",
        }
      );

    fireEvent.click(saveButton);

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

    const updatedPost =
      createPost({
        description:
          "Deskripsi sudah diperbarui.",
      });

    mocks.getPost.mockResolvedValueOnce({
      data: {
        post: updatedPost,
      },
    });

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    await screen.findByDisplayValue(
      "Ini adalah postingan test."
    );

    await changeEditDescription(
      "Deskripsi sudah diperbarui."
    );

    const saveButton =
      await screen.findByRole(
        "button",
        {
          name: "Simpan",
        }
      );

    fireEvent.click(saveButton);

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

    await waitFor(() => {
      expect(
        screen.getByText(
          "Deskripsi sudah diperbarui."
        )
      ).toBeInTheDocument();
    });
  });

  it("menampilkan loading ketika update diproses", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

    mocks.updatePost.mockReturnValue(
      action.promise
    );

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    const saveButton =
      await screen.findByRole(
        "button",
        {
          name: "Simpan",
        }
      );

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Menyimpan...",
        })
      ).toBeDisabled();
    });

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.queryByRole(
          "button",
          {
            name: "Menyimpan...",
          }
        )
      ).not.toBeInTheDocument();
    });
  });

  it("menangani klik simpan kedua ketika update masih berjalan", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

    mocks.updatePost.mockReturnValue(
      action.promise
    );

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    const saveButton =
      await screen.findByRole(
        "button",
        {
          name: "Simpan",
        }
      );

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        saveButton
      ).toBeDisabled();
    });

    saveButton.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
      })
    );

    expect(
      mocks.updatePost
    ).toHaveBeenCalledTimes(1);

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.queryByRole(
          "button",
          {
            name: "Menyimpan...",
          }
        )
      ).not.toBeInTheDocument();
    });
  });

  it("menangani error update", async () => {
    await renderReady();

    mocks.updatePost.mockRejectedValue(
      new Error("Update gagal")
    );

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    await screen.findByDisplayValue(
      "Ini adalah postingan test."
    );

    await changeEditDescription(
      "Deskripsi baru"
    );

    const saveButton =
      await screen.findByRole(
        "button",
        {
          name: "Simpan",
        }
      );

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        mocks.updatePost
      ).toHaveBeenCalledWith(
        1,
        {
          description: "Deskripsi baru",
        }
      );
    });

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

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    await screen.findByDisplayValue(
      "Ini adalah postingan test."
    );

    await changeEditDescription(
      "Deskripsi baru"
    );

    const saveButton =
      await screen.findByRole(
        "button",
        {
          name: "Simpan",
        }
      );

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        mocks.updatePost
      ).toHaveBeenCalledWith(
        1,
        {
          description: "Deskripsi baru",
        }
      );
    });

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal memperbarui",
        "Postingan gagal diperbarui."
      );
    });
  });

  /* =======================================================
     COVER
  ======================================================= */

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

  it("mengabaikan perubahan cover jika file tidak dipilih", async () => {
    await renderReady();

    const input = getCoverInput();

    fireEvent.change(input, {
      target: {
        files: [],
      },
    });

    await waitFor(() => {
      expect(
        mocks.updatePostCover
      ).not.toHaveBeenCalled();
    });

    expect(
      mocks.showErrorDialog
    ).not.toHaveBeenCalled();
  });

  it("menampilkan loading ketika cover diubah", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

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

    await waitFor(() => {
      expect(
        screen.getByText(
          "Mengubah..."
        )
      ).toBeInTheDocument();
    });

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

  it("menangani error cover non Error", async () => {
    await renderReady();

    mocks.updatePostCover.mockRejectedValue(
      "error"
    );

    const input = getCoverInput();

    const file = new File(
      ["image"],
      "cover.png",
      {
        type: "image/png"
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
        "Cover gagal diperbarui."
      );
    });
  });

  /* =======================================================
     DELETE POST
  ======================================================= */

  it("menghapus postingan setelah konfirmasi", async () => {
    await renderReady();

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Hapus",
        }
      )
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
      await screen.findByRole(
        "button",
        {
          name: "Hapus",
        }
      )
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

    const action =
      deferred<unknown>();

    mocks.deletePost.mockReturnValue(
      action.promise
    );

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Hapus",
        }
      )
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

  it("mengabaikan klik hapus kedua ketika proses pertama masih berjalan", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

    mocks.deletePost.mockReturnValue(
      action.promise
    );

    const button =
      await screen.findByRole(
        "button",
        {
          name: "Hapus",
        }
      );

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    button.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
      })
    );

    expect(
      mocks.deletePost
    ).toHaveBeenCalledTimes(1);

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
      await screen.findByRole(
        "button",
        {
          name: "Hapus",
        }
      )
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

  it("menangani error hapus postingan non Error", async () => {
    await renderReady();

    mocks.deletePost.mockRejectedValue(
      "error"
    );

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Hapus",
        }
      )
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal menghapus",
        "Postingan gagal dihapus."
      );
    });
  });

  /* =======================================================
     COMMENTS DISPLAY
  ======================================================= */

  it("menampilkan komentar yang tersedia", async () => {
    await renderReady();

    expect(
      screen.getByText(
        "Komentar test."
      )
    ).toBeInTheDocument();
  });

  it("menampilkan pesan ketika belum ada komentar", async () => {
    await renderReady(
      createPost({
        comments: [],
      })
    );

    expect(
      screen.getByText(
        "Belum ada komentar."
      )
    ).toBeInTheDocument();
  });

  it("menampilkan pesan ketika comments undefined", async () => {
    await renderReady(
      createPost({
        comments: undefined,
      })
    );

    expect(
      screen.getByText(
        "Belum ada komentar."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 komentar")
    ).toBeInTheDocument();
  });

  /* =======================================================
     ADD COMMENT
  ======================================================= */

  it("mengirim komentar", async () => {
    await renderReady();

    const callsBeforeAction =
      mocks.getPost.mock.calls.length;

    const textarea =
      await getCommentInput();

    fireEvent.change(textarea, {
      target: {
        value: "Komentar baru",
      },
    });

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      )
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
      ).toBeGreaterThan(
        callsBeforeAction
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

  it("mengirim komentar setelah spasi dipangkas", async () => {
    await renderReady();

    const textarea =
      await getCommentInput();

    fireEvent.change(textarea, {
      target: {
        value: "   Komentar dengan spasi   ",
      },
    });

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      )
    );

    await waitFor(() => {
      expect(
        mocks.addComment
      ).toHaveBeenCalledWith(
        1,
        {
          comment:
            "Komentar dengan spasi",
        }
      );
    });
  });

  it("menolak komentar kosong", async () => {
    await renderReady();

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      )
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

    const action =
      deferred<unknown>();

    mocks.addComment.mockReturnValue(
      action.promise
    );

    const textarea =
      await getCommentInput();

    fireEvent.change(textarea, {
      target: {
        value: "Komentar loading",
      },
    });

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      )
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Mengirim...",
        })
      ).toBeDisabled();
    });

    action.resolve({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Kirim Komentar",
        })
      ).not.toBeDisabled();
    });
  });

  it("mengabaikan submit komentar kedua ketika proses pertama masih berjalan", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

    mocks.addComment.mockReturnValue(
      action.promise
    );

    const textarea =
      await getCommentInput();

    fireEvent.change(textarea, {
      target: {
        value: "Komentar kedua",
      },
    });

    const button =
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      );

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    button.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
      })
    );

    expect(
      mocks.addComment
    ).toHaveBeenCalledTimes(1);

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

    const textarea =
      await getCommentInput();

    fireEvent.change(textarea, {
      target: {
        value: "Komentar error",
      },
    });

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      )
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

  it("menangani error komentar non Error", async () => {
    await renderReady();

    mocks.addComment.mockRejectedValue(
      "error"
    );

    const textarea =
      await getCommentInput();

    fireEvent.change(textarea, {
      target: {
        value: "Komentar error",
      },
    });

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      )
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Komentar gagal",
        "Gagal menambahkan komentar."
      );
    });
  });

  /* =======================================================
     DELETE COMMENT
  ======================================================= */

  it("menghapus komentar sendiri", async () => {
    await renderReady();

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: /Hapus Komentar Saya/i,
        }
      )
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
      await screen.findByRole(
        "button",
        {
          name: /Hapus Komentar Saya/i,
        }
      )
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

    const action =
      deferred<unknown>();

    mocks.deleteComment.mockReturnValue(
      action.promise
    );

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: /Hapus Komentar Saya/i,
        }
      )
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
        screen.getByRole(
          "button",
          {
            name: /Hapus Komentar Saya/i,
          }
        )
      ).not.toBeDisabled();
    });
  });

  it("mengabaikan klik hapus komentar kedua ketika proses pertama masih berjalan", async () => {
    await renderReady();

    const action =
      deferred<unknown>();

    mocks.deleteComment.mockReturnValue(
      action.promise
    );

    const button =
      await screen.findByRole(
        "button",
        {
          name: /Hapus Komentar Saya/i,
        }
      );

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    button.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
      })
    );

    expect(
      mocks.deleteComment
    ).toHaveBeenCalledTimes(1);

    action.resolve({});

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("menangani error hapus komentar", async () => {
    await renderReady();

    mocks.deleteComment.mockRejectedValue(
      new Error(
        "Komentar delete gagal"
      )
    );

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: /Hapus Komentar Saya/i,
        }
      )
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

  it("menangani error hapus komentar non Error", async () => {
    await renderReady();

    mocks.deleteComment.mockRejectedValue(
      "error"
    );

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: /Hapus Komentar Saya/i,
        }
      )
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Gagal menghapus komentar",
        "Komentar gagal dihapus."
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
        name: /Hapus Komentar Saya/i,
      })
    ).not.toBeInTheDocument();
  });
  /* =======================================================
     GUARD / EARLY RETURN COVER
  ======================================================= */

 
  /* =======================================================
     LOAD ERRORS
  ======================================================= */

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

  it("menangani postId tidak valid", async () => {
    mocks.navigation.postId = "abc";

    render(<DetailPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Postingan tidak ditemukan",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "ID postingan tidak valid."
      )
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Kembali",
      })
    );

    expect(
      mocks.replace
    ).toHaveBeenCalledWith("/");
  });

  /* =======================================================
     REFRESH ERRORS
  ======================================================= */

  it("mengabaikan refresh post yang gagal setelah komentar", async () => {
    await renderReady();

    mocks.getPost.mockRejectedValueOnce(
      new Error("Refresh gagal")
    );

    const textarea =
      await getCommentInput();

    fireEvent.change(textarea, {
      target: {
        value: "Komentar refresh",
      },
    });

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: "Kirim Komentar",
        }
      )
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

    const editButton =
      await getOwnerEditButton();

    fireEvent.click(editButton);

    await screen.findByDisplayValue(
      "Ini adalah postingan test."
    );

    await changeEditDescription(
      "Update refresh gagal"
    );

    const saveButton =
      await screen.findByRole(
        "button",
        {
          name: "Simpan",
        }
      );

    fireEvent.click(saveButton);

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

  it("tetap menyelesaikan perubahan cover jika refresh gagal", async () => {
    await renderReady();

    mocks.getPost.mockRejectedValueOnce(
      new Error("Refresh cover gagal")
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

  it("tetap menyelesaikan hapus komentar jika refresh gagal", async () => {
    await renderReady();

    mocks.getPost.mockRejectedValueOnce(
      new Error("Refresh komentar gagal")
    );

    fireEvent.click(
      await screen.findByRole(
        "button",
        {
          name: /Hapus Komentar Saya/i,
        }
      )
    );

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

  it("tetap menyelesaikan like jika refresh gagal", async () => {
    await renderReady();

    mocks.getPost.mockRejectedValueOnce(
      new Error("Refresh like gagal")
    );

    const button =
      await screen.findByRole(
        "button",
        {
          name: "♥ Disukai",
        }
      );

    fireEvent.click(button);

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
      expect(button).not.toBeDisabled();
    });

    expect(
      mocks.showErrorDialog
    ).not.toHaveBeenCalled();
  });
});