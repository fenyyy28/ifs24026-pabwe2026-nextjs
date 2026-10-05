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
  selectorState: {
    isPostAdd: false,
    isPostAdded: false,
    error: null as string | null,
  },
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  addPostThunk: vi.fn((payload) => ({
    type: "posts/addPost",
    payload,
  })),
  fetchPosts: vi.fn((value) => ({
    type: "posts/fetchPosts",
    payload: value,
  })),
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      posts: mocks.selectorState,
    }),
}));

vi.mock("@/helpers/toolsHelper", () => ({
  showErrorDialog: mocks.showErrorDialog,
  showSuccessDialog: mocks.showSuccessDialog,
}));

vi.mock("@/features/posts/states/reducer", () => ({
  addPostThunk: mocks.addPostThunk,
  fetchPosts: mocks.fetchPosts,
}));

import AddModal from "./AddModal";

describe("AddModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.selectorState.isPostAdd = false;
    mocks.selectorState.isPostAdded = false;
    mocks.selectorState.error = null;

    mocks.showSuccessDialog.mockResolvedValue(undefined);
    mocks.showErrorDialog.mockResolvedValue(undefined);
    mocks.dispatch.mockResolvedValue(undefined);
  });

  it("tidak menampilkan modal ketika open false", () => {
    const { container } = render(
      <AddModal open={false} onClose={onClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("menampilkan modal ketika open true", () => {
    render(<AddModal open={true} onClose={onClose} />);

    expect(
      screen.getByRole("dialog")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Buat Postingan",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Bagikan cerita atau informasi kamu.")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Isi Postingan")
    ).toBeInTheDocument();
  });

  it("menampilkan tombol Tutup modal dan Batal", () => {
    render(<AddModal open={true} onClose={onClose} />);

    expect(
      screen.getByRole("button", {
        name: "Tutup modal",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Batal",
      })
    ).toBeInTheDocument();
  });

  it("memanggil onClose ketika tombol Tutup modal diklik", () => {
    render(<AddModal open={true} onClose={onClose} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tutup modal",
      })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose ketika tombol Batal diklik", () => {
    render(<AddModal open={true} onClose={onClose} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Batal",
      })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menonaktifkan tombol Publikasikan ketika deskripsi kosong", () => {
    render(<AddModal open={true} onClose={onClose} />);

    expect(
      screen.getByRole("button", {
        name: "Publikasikan",
      })
    ).toBeDisabled();
  });

  it("menampilkan jumlah karakter sesuai isi textarea", () => {
    render(<AddModal open={true} onClose={onClose} />);

    const textarea = screen.getByLabelText("Isi Postingan");

    fireEvent.change(textarea, {
      target: {
        value: "Halo dunia",
      },
    });

    expect(textarea).toHaveValue("Halo dunia");
    expect(screen.getByText("10 karakter")).toBeInTheDocument();
  });

  it("menampilkan error ketika submit dengan deskripsi kosong", async () => {
    render(<AddModal open={true} onClose={onClose} />);

    const form = screen.getByRole("button", {
      name: "Publikasikan",
    }).closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Deskripsi belum diisi",
        "Silakan tulis isi postingan terlebih dahulu."
      );
    });

    expect(mocks.addPostThunk).not.toHaveBeenCalled();
  });

  it("mengirim postingan dengan deskripsi yang sudah di-trim", async () => {
    render(<AddModal open={true} onClose={onClose} />);

    const textarea = screen.getByLabelText("Isi Postingan");

    fireEvent.change(textarea, {
      target: {
        value: "   Postingan saya   ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Publikasikan",
      })
    );

    await waitFor(() => {
      expect(mocks.addPostThunk).toHaveBeenCalledWith({
        description: "Postingan saya",
      });
    });

    expect(mocks.dispatch).toHaveBeenCalled();
  });

  it("menampilkan status Menyimpan ketika proses tambah postingan berlangsung", () => {
    mocks.selectorState.isPostAdd = true;

    render(<AddModal open={true} onClose={onClose} />);

    expect(
      screen.getByRole("button", {
        name: "Menyimpan...",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Menyimpan...",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Tutup modal",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Batal",
      })
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Isi Postingan")
    ).toBeDisabled();
  });

  it("menampilkan error dari Redux ketika modal terbuka", async () => {
    mocks.selectorState.error = "Gagal menyimpan postingan";

    render(<AddModal open={true} onClose={onClose} />);

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Gagal membuat postingan",
        "Gagal menyimpan postingan"
      );
    });
  });

  it("tidak menampilkan error Redux ketika modal tertutup", async () => {
    mocks.selectorState.error = "Gagal menyimpan postingan";

    render(<AddModal open={false} onClose={onClose} />);

    await waitFor(() => {
      expect(mocks.showErrorDialog).not.toHaveBeenCalled();
    });
  });

  it("menjalankan alur setelah postingan berhasil dibuat", async () => {
    mocks.selectorState.isPostAdded = true;

    render(<AddModal open={true} onClose={onClose} />);

    await waitFor(() => {
      expect(mocks.showSuccessDialog).toHaveBeenCalledWith(
        "Postingan berhasil dibuat",
        "Postingan kamu sudah berhasil ditambahkan."
      );
    });

    expect(mocks.fetchPosts).toHaveBeenCalledWith(false);

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "posts/fetchPosts",
      payload: false,
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mengosongkan textarea ketika modal dibuka kembali", () => {
    const { rerender } = render(
      <AddModal open={true} onClose={onClose} />
    );

    const textarea = screen.getByLabelText("Isi Postingan");

    fireEvent.change(textarea, {
      target: {
        value: "Postingan sementara",
      },
    });

    expect(textarea).toHaveValue("Postingan sementara");

    rerender(
      <AddModal open={false} onClose={onClose} />
    );

    rerender(
      <AddModal open={true} onClose={onClose} />
    );

    expect(
      screen.getByLabelText("Isi Postingan")
    ).toHaveValue("");

    expect(
      screen.getByText("0 karakter")
    ).toBeInTheDocument();
  });
});