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
    isPostChange: false,
    isPostChanged: false,
    error: null as string | null,
  },
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  changePost: vi.fn((payload) => ({
    type: "posts/changePost",
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
  changePost: mocks.changePost,
}));

import ChangeModal from "./ChangeModal";

describe("ChangeModal", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.selectorState.isPostChange = false;
    mocks.selectorState.isPostChanged = false;
    mocks.selectorState.error = null;

    mocks.showSuccessDialog.mockResolvedValue(undefined);
    mocks.showErrorDialog.mockResolvedValue(undefined);
    mocks.dispatch.mockResolvedValue(undefined);
  });

  it("tidak menampilkan modal ketika open false", () => {
    const { container } = render(
      <ChangeModal
        open={false}
        postId={1}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("tidak menampilkan modal ketika postId null", () => {
    const { container } = render(
      <ChangeModal
        open={true}
        postId={null}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("menampilkan modal ketika open true dan postId tersedia", () => {
    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Ubah Postingan",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Perbarui isi deskripsi postingan kamu."
      )
    ).toBeInTheDocument();
  });

  it("menampilkan currentDescription pada textarea", () => {
    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Deskripsi awal"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByLabelText("Deskripsi Postingan")
    ).toHaveValue("Deskripsi awal");

    expect(
      screen.getByText("14 karakter")
    ).toBeInTheDocument();
  });

  it("memanggil onClose ketika tombol Tutup modal diklik", () => {
    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
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
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
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

  it("menonaktifkan tombol simpan ketika deskripsi kosong", () => {
    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription=""
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Simpan Perubahan",
      })
    ).toBeDisabled();
  });

  it("mengubah isi textarea dan jumlah karakter", () => {
    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const textarea = screen.getByLabelText(
      "Deskripsi Postingan"
    );

    fireEvent.change(textarea, {
      target: {
        value: "Deskripsi baru",
      },
    });

    expect(textarea).toHaveValue("Deskripsi baru");

    expect(
      screen.getByText("14 karakter")
    ).toBeInTheDocument();
  });

  it("menampilkan error ketika deskripsi kosong saat submit", async () => {
    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const textarea = screen.getByLabelText(
      "Deskripsi Postingan"
    );

    fireEvent.change(textarea, {
      target: {
        value: "   ",
      },
    });

    const form = screen
      .getByRole("button", {
        name: "Simpan Perubahan",
      })
      .closest("form");

    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Deskripsi belum diisi",
        "Silakan isi deskripsi postingan terlebih dahulu."
      );
    });

    expect(mocks.changePost).not.toHaveBeenCalled();
  });

  it("menampilkan error ketika deskripsi tidak berubah", async () => {
    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const textarea = screen.getByLabelText(
      "Deskripsi Postingan"
    );

    fireEvent.change(textarea, {
      target: {
        value: "   Postingan lama   ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan Perubahan",
      })
    );

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Tidak ada perubahan",
        "Silakan ubah deskripsi sebelum menyimpan."
      );
    });

    expect(mocks.changePost).not.toHaveBeenCalled();
  });

  it("mengirim perubahan postingan dengan data yang sudah di-trim", async () => {
    render(
      <ChangeModal
        open={true}
        postId={25}
        currentDescription="Deskripsi lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const textarea = screen.getByLabelText(
      "Deskripsi Postingan"
    );

    fireEvent.change(textarea, {
      target: {
        value: "   Deskripsi baru   ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simpan Perubahan",
      })
    );

    await waitFor(() => {
      expect(mocks.changePost).toHaveBeenCalledWith({
        postId: 25,
        description: "Deskripsi baru",
      });
    });

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "posts/changePost",
      payload: {
        postId: 25,
        description: "Deskripsi baru",
      },
    });
  });

  it("menampilkan status Menyimpan ketika proses perubahan berlangsung", () => {
    mocks.selectorState.isPostChange = true;

    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

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
      screen.getByLabelText("Deskripsi Postingan")
    ).toBeDisabled();
  });

  it("menampilkan error Redux ketika modal terbuka", async () => {
    mocks.selectorState.error =
      "Gagal memperbarui postingan";

    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(mocks.showErrorDialog).toHaveBeenCalledWith(
        "Gagal mengubah postingan",
        "Gagal memperbarui postingan"
      );
    });
  });

  it("tidak menampilkan error Redux ketika modal tertutup", async () => {
    mocks.selectorState.error =
      "Gagal memperbarui postingan";

    render(
      <ChangeModal
        open={false}
        postId={10}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(mocks.showErrorDialog).not.toHaveBeenCalled();
    });
  });

  it("menjalankan alur setelah postingan berhasil diubah", async () => {
    mocks.selectorState.isPostChanged = true;

    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(mocks.showSuccessDialog).toHaveBeenCalledWith(
        "Postingan berhasil diubah",
        "Deskripsi postingan sudah diperbarui."
      );
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("tetap berhasil tanpa onSuccess", async () => {
    mocks.selectorState.isPostChanged = true;

    render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Postingan lama"
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(mocks.showSuccessDialog).toHaveBeenCalled();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memperbarui textarea ketika currentDescription berubah", () => {
    const { rerender } = render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Deskripsi pertama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByLabelText("Deskripsi Postingan")
    ).toHaveValue("Deskripsi pertama");

    rerender(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Deskripsi kedua"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByLabelText("Deskripsi Postingan")
    ).toHaveValue("Deskripsi kedua");
  });

  it("tidak memperbarui textarea dari currentDescription ketika modal tertutup", () => {
    const { rerender } = render(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Deskripsi pertama"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const textarea = screen.getByLabelText(
      "Deskripsi Postingan"
    );

    fireEvent.change(textarea, {
      target: {
        value: "Perubahan sementara",
      },
    });

    rerender(
      <ChangeModal
        open={false}
        postId={10}
        currentDescription="Deskripsi kedua"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    rerender(
      <ChangeModal
        open={true}
        postId={10}
        currentDescription="Deskripsi kedua"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByLabelText("Deskripsi Postingan")
    ).toHaveValue("Deskripsi kedua");
  });
});