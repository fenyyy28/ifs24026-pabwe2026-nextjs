import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  fetchPosts: vi.fn((isMyPosts: boolean) => ({
    type: "posts/fetchPosts",
    payload: isMyPosts,
  })),
  showErrorDialog: vi.fn(),
  formatDate: vi.fn((date: string) => `Formatted ${date}`),
  searchParamsGet: vi.fn(),
  addModalProps: {
    open: false,
    onClose: vi.fn(),
  },
  selectorState: {
    posts: [] as any[],
    isPost: false,
    error: null as string | null,
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mocks.searchParamsGet,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      posts: mocks.selectorState,
    }),
}));

vi.mock("@/features/posts/states/reducer", () => ({
  fetchPosts: mocks.fetchPosts,
}));

vi.mock("@/helpers/toolsHelper", () => ({
  formatDate: mocks.formatDate,
  showErrorDialog: mocks.showErrorDialog,
}));

vi.mock("@/features/posts/layouts/PostLayout", () => ({
  default: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="post-layout">{children}</div>,
}));

vi.mock("@/features/posts/modals/AddModal", () => ({
  default: ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
    mocks.addModalProps.open = open;
    mocks.addModalProps.onClose = onClose;

    return open ? (
      <div data-testid="add-modal">
        <span>Add Modal</span>
        <button
          type="button"
          onClick={onClose}
        >
          Tutup Add Modal
        </button>
      </div>
    ) : null;
  },
}));

import HomePage from "./HomePage";

describe("HomePage", () => {
  const createPost = (overrides = {}) => ({
    id: 1,
    description: "Belajar React di Delcom",
    cover: "https://example.com/cover.jpg",
    created_at: "2026-10-01T10:00:00Z",
    author: {
      name: "Feny Pasaribu",
      photo: "https://example.com/feny.jpg",
    },
    likes: [{ id: 1 }, { id: 2 }],
    comments: [{ id: 1 }],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.searchParamsGet.mockReturnValue(null);

    mocks.selectorState.posts = [];
    mocks.selectorState.isPost = false;
    mocks.selectorState.error = null;

    mocks.dispatch.mockResolvedValue(undefined);

    mocks.addModalProps.open = false;
    mocks.addModalProps.onClose = vi.fn();
  });

  it("menampilkan halaman utama dengan judul semua postingan", async () => {
    render(<HomePage />);

    expect(
      screen.getByText("Semua Postingan")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Temukan Postingan")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Bagikan cerita, pengalaman, dan informasi bersama pengguna Delcom Posts."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "+ Buat Postingan",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Cari postingan atau nama pengguna..."
      )
    ).toBeInTheDocument();
  });

  it("mengambil postingan umum ketika parameter is_me bukan 1", async () => {
    mocks.searchParamsGet.mockReturnValue(null);

    render(<HomePage />);

    await waitFor(() => {
      expect(mocks.fetchPosts).toHaveBeenCalledWith(false);
    });

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "posts/fetchPosts",
      payload: false,
    });
  });

  it("mengambil postingan saya ketika parameter is_me bernilai 1", async () => {
    mocks.searchParamsGet.mockReturnValue("1");

    render(<HomePage />);

    await waitFor(() => {
      expect(mocks.fetchPosts).toHaveBeenCalledWith(true);
    });

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "posts/fetchPosts",
      payload: true,
    });

    expect(
      screen.getAllByText("Postingan Saya")
    ).toHaveLength(2);

    expect(
      screen.getByText(
        "Bagikan cerita, pengalaman, dan informasi bersama pengguna Delcom Posts."
      )
    ).toBeInTheDocument();
  });

  it("menampilkan loading ketika postingan sedang dimuat", () => {
    mocks.selectorState.isPost = true;

    render(<HomePage />);

    expect(
      screen.getByText("Memuat postingan...")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Belum ada postingan")
    ).not.toBeInTheDocument();
  });

  it("menampilkan empty state ketika tidak ada postingan", () => {
    mocks.selectorState.posts = [];
    mocks.selectorState.isPost = false;

    render(<HomePage />);

    expect(
      screen.getByText("Belum ada postingan")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Belum ada postingan yang sesuai dengan pencarian kamu."
      )
    ).toBeInTheDocument();
  });

  it("menampilkan error dialog ketika terjadi error", async () => {
    mocks.selectorState.error =
      "Gagal mengambil postingan";

    render(<HomePage />);

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Gagal memuat postingan",
        "Gagal mengambil postingan"
      );
    });
  });

  it("tidak menampilkan error dialog ketika error null", () => {
    mocks.selectorState.error = null;

    render(<HomePage />);

    expect(
      mocks.showErrorDialog
    ).not.toHaveBeenCalled();
  });

  it("menampilkan postingan dengan cover dan foto author", () => {
    mocks.selectorState.posts = [
      createPost(),
    ];

    render(<HomePage />);

    expect(
      screen.getByText("Belajar React di Delcom")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Feny Pasaribu")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText(
        "Cover postingan Belajar React di Delcom"
      )
    ).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg"
    );

    expect(
      screen.getByAltText("Foto Feny Pasaribu")
    ).toHaveAttribute(
      "src",
      "https://example.com/feny.jpg"
    );

    expect(
      screen.getByText("Formatted 2026-10-01T10:00:00Z")
    ).toBeInTheDocument();

    expect(
      screen.getByText("❤️ 2 Like")
    ).toBeInTheDocument();

    expect(
      screen.getByText("💬 1 Komentar")
    ).toBeInTheDocument();
  });

  it("menampilkan fallback ketika postingan tidak memiliki cover", () => {
    mocks.selectorState.posts = [
      createPost({
        cover: null,
      }),
    ];

    render(<HomePage />);

    expect(
      screen.getByText("📝")
    ).toBeInTheDocument();

    expect(
      screen.queryByAltText(
        "Cover postingan Belajar React di Delcom"
      )
    ).not.toBeInTheDocument();
  });

  it("menampilkan inisial author ketika author tidak memiliki foto", () => {
    mocks.selectorState.posts = [
      createPost({
        author: {
          name: "Budi",
          photo: null,
        },
      }),
    ];

    render(<HomePage />);

    expect(
      screen.getByText("Budi")
    ).toBeInTheDocument();

    expect(
      screen.queryByAltText("Foto Budi")
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("B", {
        selector: "div",
      })
    ).toBeInTheDocument();
  });

  it("membuka AddModal ketika tombol Buat Postingan diklik", async () => {
    render(<HomePage />);

    expect(
      screen.queryByTestId("add-modal")
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "+ Buat Postingan",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("add-modal")
      ).toBeInTheDocument();
    });

    expect(mocks.addModalProps.open).toBe(true);
  });

  it("menutup AddModal ketika callback onClose dijalankan", async () => {
    render(<HomePage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "+ Buat Postingan",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("add-modal")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tutup Add Modal",
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("add-modal")
      ).not.toBeInTheDocument();
    });

    expect(mocks.addModalProps.open).toBe(false);
  });

  it("memfilter postingan berdasarkan description", async () => {
    mocks.selectorState.posts = [
      createPost({
        id: 1,
        description: "Belajar React",
      }),
      createPost({
        id: 2,
        description: "Belajar NextJS",
      }),
    ];

    render(<HomePage />);

    const searchInput =
      screen.getByPlaceholderText(
        "Cari postingan atau nama pengguna..."
      );

    fireEvent.change(searchInput, {
      target: {
        value: "react",
      },
    });

    expect(
      screen.getByText("Belajar React")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Belajar NextJS")
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Menampilkan 1 dari 2 postingan.")
    ).toBeInTheDocument();
  });

  it("memfilter postingan berdasarkan nama author", async () => {
    mocks.selectorState.posts = [
      createPost({
        id: 1,
        description: "Postingan Pertama",
        author: {
          name: "Feny",
          photo: null,
        },
      }),
      createPost({
        id: 2,
        description: "Postingan Kedua",
        author: {
          name: "Budi",
          photo: null,
        },
      }),
    ];

    render(<HomePage />);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Cari postingan atau nama pengguna..."
      ),
      {
        target: {
          value: "feny",
        },
      }
    );

    expect(
      screen.getByText("Postingan Pertama")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Postingan Kedua")
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Menampilkan 1 dari 2 postingan.")
    ).toBeInTheDocument();
  });

  it("mengabaikan spasi dan huruf besar kecil pada pencarian", () => {
    mocks.selectorState.posts = [
      createPost({
        description: "React Testing",
      }),
    ];

    render(<HomePage />);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Cari postingan atau nama pengguna..."
      ),
      {
        target: {
          value: "   REACT TESTING   ",
        },
      }
    );

    expect(
      screen.getByText("React Testing")
    ).toBeInTheDocument();
  });

  it("menampilkan semua postingan ketika pencarian kosong", () => {
    mocks.selectorState.posts = [
      createPost({
        id: 1,
        description: "Postingan Satu",
      }),
      createPost({
        id: 2,
        description: "Postingan Dua",
      }),
    ];

    render(<HomePage />);

    const searchInput =
      screen.getByPlaceholderText(
        "Cari postingan atau nama pengguna..."
      );

    fireEvent.change(searchInput, {
      target: {
        value: "tidak ada",
      },
    });

    expect(
      screen.getByText("Belum ada postingan")
    ).toBeInTheDocument();

    fireEvent.change(searchInput, {
      target: {
        value: "",
      },
    });

    expect(
      screen.getByText("Postingan Satu")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Postingan Dua")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Menampilkan 2 dari 2 postingan.")
    ).toBeInTheDocument();
  });

  it("menampilkan empty state ketika hasil pencarian tidak ditemukan", () => {
    mocks.selectorState.posts = [
      createPost({
        description: "Belajar React",
      }),
    ];

    render(<HomePage />);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Cari postingan atau nama pengguna..."
      ),
      {
        target: {
          value: "xyz",
        },
      }
    );

    expect(
      screen.getByText("Belum ada postingan")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Belum ada postingan yang sesuai dengan pencarian kamu."
      )
    ).toBeInTheDocument();
  });

  it("memiliki link menuju detail postingan", () => {
    mocks.selectorState.posts = [
      createPost({
        id: 25,
      }),
    ];

    render(<HomePage />);

    const links = screen.getAllByRole("link");

    const postLinks = links.filter(
      (link) => link.getAttribute("href") === "/posts/25"
    );

    expect(postLinks.length).toBe(2);
  });

  it("menampilkan jumlah postingan yang sesuai", () => {
    mocks.selectorState.posts = [
      createPost({
        id: 1,
        description: "Satu",
      }),
      createPost({
        id: 2,
        description: "Dua",
      }),
      createPost({
        id: 3,
        description: "Tiga",
      }),
    ];

    render(<HomePage />);

    expect(
      screen.getByText("Menampilkan 3 dari 3 postingan.")
    ).toBeInTheDocument();
  });

  it("tidak menampilkan jumlah postingan ketika posts kosong", () => {
    mocks.selectorState.posts = [];

    render(<HomePage />);

    expect(
      screen.queryByText(/Menampilkan .* dari .* postingan/)
    ).not.toBeInTheDocument();
  });
});