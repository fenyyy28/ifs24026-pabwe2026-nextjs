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
    isPostChangeCover: false,
    isPostChangedCover: false,
    error: null as string | null,
  },
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  changePostCover: vi.fn((payload) => ({
    type: "posts/changePostCover",
    payload,
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
  changePostCover: mocks.changePostCover,
}));

import ChangeCoverModal from "./ChangeCoverModal";

describe("ChangeCoverModal", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.selectorState.isPostChangeCover = false;
    mocks.selectorState.isPostChangedCover = false;
    mocks.selectorState.error = null;

    mocks.showSuccessDialog.mockResolvedValue(undefined);
    mocks.showErrorDialog.mockResolvedValue(undefined);
    mocks.dispatch.mockResolvedValue(undefined);

    vi.stubGlobal(
      "URL",
      {
        createObjectURL: vi.fn(
          (file: File) => `blob:${file.name}`
        ),
        revokeObjectURL: vi.fn(),
      }
    );
  });

  it("tidak menampilkan modal ketika open false", () => {
    const { container } = render(
      <ChangeCoverModal
        open={false}
        postId={1}
        currentCover="https://example.com/cover.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("tidak menampilkan modal ketika postId null", () => {
    const { container } = render(
      <ChangeCoverModal
        open={true}
        postId={null}
        currentCover="https://example.com/cover.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("menampilkan modal ketika open true dan postId tersedia", () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Ubah Cover",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Pilih gambar baru untuk cover postingan."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Pilih Gambar")
    ).toBeInTheDocument();
  });

  it("menampilkan cover saat currentCover tersedia", () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        currentCover="https://example.com/cover.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const image = screen.getByAltText(
      "Preview cover postingan"
    );

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg"
    );
  });

  it("menampilkan placeholder ketika tidak ada cover", () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        currentCover={null}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByText("Belum ada gambar")
    ).toBeInTheDocument();
  });

  it("memanggil onClose ketika tombol Tutup modal diklik", () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tutup modal",
      })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memanggil onClose ketika tombol Batal diklik", () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Batal",
      })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menonaktifkan tombol Simpan Cover ketika belum memilih file", () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Simpan Cover",
      })
    ).toBeDisabled();
  });

  it("menampilkan error ketika submit tanpa memilih gambar", async () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const form = screen
      .getByRole("button", {
        name: "Simpan Cover",
      })
      .closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Pilih gambar terlebih dahulu",
        "Silakan pilih gambar yang ingin digunakan sebagai cover."
      );
    });

    expect(mocks.changePostCover).not.toHaveBeenCalled();
  });

  it("menolak file yang bukan gambar", async () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Pilih Gambar");

    const file = new File(
      ["dokumen"],
      "dokumen.pdf",
      {
        type: "application/pdf",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "File tidak valid",
        "Silakan pilih file gambar."
      );
    });

    expect(
      screen.queryByText("File dipilih: dokumen.pdf")
    ).not.toBeInTheDocument();

    expect(input).toHaveValue("");
  });

  it("menolak file gambar yang ukurannya lebih dari 5 MB", async () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Pilih Gambar");

    const largeFile = new File(
      ["gambar"],
      "gambar-besar.jpg",
      {
        type: "image/jpeg",
      }
    );

    Object.defineProperty(largeFile, "size", {
      value: 6 * 1024 * 1024,
    });

    fireEvent.change(input, {
      target: {
        files: [largeFile],
      },
    });

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Ukuran file terlalu besar",
        "Ukuran gambar maksimal 5 MB."
      );
    });

    expect(
      screen.queryByText(
        "File dipilih: gambar-besar.jpg"
      )
    ).not.toBeInTheDocument();

    expect(input).toHaveValue("");
  });

  it("mengabaikan perubahan input ketika tidak ada file", () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Pilih Gambar");

    fireEvent.change(input, {
      target: {
        files: [],
      },
    });

    expect(
      screen.queryByText(/File dipilih:/)
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Simpan Cover",
      })
    ).toBeDisabled();
  });

  it("menerima file gambar yang valid dan menampilkan nama file", async () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Pilih Gambar");

    const file = new File(
      ["gambar"],
      "cover-baru.jpg",
      {
        type: "image/jpeg",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText("File dipilih: cover-baru.jpg")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", {
        name: "Simpan Cover",
      })
    ).toBeEnabled();
  });

  it("menampilkan preview dari file gambar yang dipilih", async () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Pilih Gambar");

    const file = new File(
      ["gambar"],
      "cover-baru.png",
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
      const image = screen.getByAltText(
        "Preview cover postingan"
      );

      expect(image).toHaveAttribute(
        "src",
        "blob:cover-baru.png"
      );
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it("mengirim perubahan cover dengan postId dan file", async () => {
    render(
      <ChangeCoverModal
        open={true}
        postId={25}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Pilih Gambar");

    const file = new File(
      ["gambar"],
      "cover.jpg",
      {
        type: "image/jpeg",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText("File dipilih: cover.jpg")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan Cover",
      })
    );

    await waitFor(() => {
      expect(mocks.changePostCover).toHaveBeenCalledWith({
        postId: 25,
        file,
      });
    });

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "posts/changePostCover",
      payload: {
        postId: 25,
        file,
      },
    });
  });

  it("menampilkan status Mengupload ketika proses berlangsung", () => {
    mocks.selectorState.isPostChangeCover = true;

    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Mengupload...",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Mengupload...",
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
      screen.getByLabelText("Pilih Gambar")
    ).toBeDisabled();
  });

  it("menampilkan error Redux ketika modal terbuka", async () => {
    mocks.selectorState.error =
      "Gagal memperbarui cover";

    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Gagal mengubah cover",
        "Gagal memperbarui cover"
      );
    });
  });

  it("tidak menampilkan error Redux ketika modal tertutup", async () => {
    mocks.selectorState.error =
      "Gagal memperbarui cover";

    render(
      <ChangeCoverModal
        open={false}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(mocks.showErrorDialog).not.toHaveBeenCalled();
    });
  });

  it("menjalankan alur setelah cover berhasil diubah", async () => {
    mocks.selectorState.isPostChangedCover = true;

    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(mocks.showSuccessDialog).toHaveBeenCalledWith(
        "Cover berhasil diubah",
        "Cover postingan sudah berhasil diperbarui."
      );
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("tetap berhasil tanpa callback onSuccess", async () => {
    mocks.selectorState.isPostChangedCover = true;

    render(
      <ChangeCoverModal
        open={true}
        postId={10}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(mocks.showSuccessDialog).toHaveBeenCalled();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memperbarui preview ketika currentCover berubah", () => {
    const { rerender } = render(
      <ChangeCoverModal
        open={true}
        postId={10}
        currentCover="https://example.com/cover-1.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByAltText("Preview cover postingan")
    ).toHaveAttribute(
      "src",
      "https://example.com/cover-1.jpg"
    );

    rerender(
      <ChangeCoverModal
        open={true}
        postId={10}
        currentCover="https://example.com/cover-2.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByAltText("Preview cover postingan")
    ).toHaveAttribute(
      "src",
      "https://example.com/cover-2.jpg"
    );
  });

  it("mereset file dan preview ketika modal ditutup", async () => {
    const { rerender } = render(
      <ChangeCoverModal
        open={true}
        postId={10}
        currentCover="https://example.com/cover.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Pilih Gambar");

    const file = new File(
      ["gambar"],
      "cover-baru.jpg",
      {
        type: "image/jpeg",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText("File dipilih: cover-baru.jpg")
      ).toBeInTheDocument();
    });

    rerender(
      <ChangeCoverModal
        open={false}
        postId={10}
        currentCover="https://example.com/cover.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    rerender(
      <ChangeCoverModal
        open={true}
        postId={10}
        currentCover="https://example.com/cover.jpg"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.queryByText("File dipilih: cover-baru.jpg")
    ).not.toBeInTheDocument();

    expect(
      screen.getByAltText("Preview cover postingan")
    ).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg"
    );
  });
});