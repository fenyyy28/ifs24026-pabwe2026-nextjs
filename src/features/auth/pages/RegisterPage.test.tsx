import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";

import { renderWithProviders } from "@/test-utils";
import RegisterPage from "@/features/auth/pages/RegisterPage";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  dispatch: vi.fn(),
  selector: vi.fn(),
  authRegister: Object.assign(vi.fn(), {
    fulfilled: {
      match: vi.fn(),
    },
  }),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mocks.replace,
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (
    selector: (state: unknown) => unknown
  ) => mocks.selector(selector),
}));

vi.mock(
  "@/features/auth/states/reducer",
  async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/auth/states/reducer")>();

    return {
      ...actual,
      authRegister: mocks.authRegister,
    };
  }
);

vi.mock("@/helpers/toolsHelper", () => ({
  showErrorDialog: mocks.showErrorDialog,
  showSuccessDialog: mocks.showSuccessDialog,
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.selector.mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          auth: {
            isAuthRegister: false,
            error: null,
          },
        })
    );

    mocks.authRegister.fulfilled.match.mockReturnValue(
      false
    );

    mocks.dispatch.mockResolvedValue({
      type: "auth/register/rejected",
    });
  });

  const fillValidForm = () => {
    fireEvent.change(
      screen.getByLabelText("Nama"),
      {
        target: {
          value: "Feny Rika Pasaribu",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password", {
        exact: true,
      }),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        "Konfirmasi Password",
        {
          exact: true,
        }
      ),
      {
        target: {
          value: "password123",
        },
      }
    );
  };

  it("menampilkan form registrasi", () => {
    renderWithProviders(<RegisterPage />);

    expect(
      screen.getByRole("heading", {
        name: /buat akun baru/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Nama")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password", {
        exact: true,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Konfirmasi Password",
        {
          exact: true,
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Daftar",
      })
    ).toBeInTheDocument();
  });

  it("menampilkan link menuju halaman login", () => {
    renderWithProviders(<RegisterPage />);

    const loginLink = screen.getByRole("link", {
      name: /masuk sekarang/i,
    });

    expect(loginLink).toBeInTheDocument();

    expect(loginLink).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });

  it("mengisi nama, email, password, dan konfirmasi password", () => {
    renderWithProviders(<RegisterPage />);

    fillValidForm();

    expect(
      (
        screen.getByLabelText("Nama") as HTMLInputElement
      ).value
    ).toBe("Feny Rika Pasaribu");

    expect(
      (
        screen.getByLabelText("Email") as HTMLInputElement
      ).value
    ).toBe("feny@example.com");

    expect(
      (
        screen.getByLabelText("Password", {
          exact: true,
        }) as HTMLInputElement
      ).value
    ).toBe("password123");

    expect(
      (
        screen.getByLabelText(
          "Konfirmasi Password",
          {
            exact: true,
          }
        ) as HTMLInputElement
      ).value
    ).toBe("password123");
  });

  it("tidak mengirim form jika nama kosong", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password", {
        exact: true,
      }),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Nama belum diisi",
        "Silakan masukkan nama lengkap kamu."
      );
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("tidak mengirim form jika email kosong", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(
      screen.getByLabelText("Nama"),
      {
        target: {
          value: "Feny Rika Pasaribu",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password", {
        exact: true,
      }),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Email belum diisi",
        "Silakan masukkan email kamu."
      );
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("tidak mengirim form jika password kosong", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(
      screen.getByLabelText("Nama"),
      {
        target: {
          value: "Feny Rika Pasaribu",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Password belum diisi",
        "Silakan masukkan password kamu."
      );
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("menolak password kurang dari 6 karakter", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(
      screen.getByLabelText("Nama"),
      {
        target: {
          value: "Feny Rika Pasaribu",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password", {
        exact: true,
      }),
      {
        target: {
          value: "12345",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        "Konfirmasi Password",
        {
          exact: true,
        }
      ),
      {
        target: {
          value: "12345",
        },
      }
    );

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Password terlalu pendek",
        "Password minimal terdiri dari 6 karakter."
      );
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("menolak jika password dan konfirmasi password berbeda", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(
      screen.getByLabelText("Nama"),
      {
        target: {
          value: "Feny Rika Pasaribu",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password", {
        exact: true,
      }),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        "Konfirmasi Password",
        {
          exact: true,
        }
      ),
      {
        target: {
          value: "password456",
        },
      }
    );

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Password tidak sama",
        "Pastikan konfirmasi password sama dengan password."
      );
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("berhasil melakukan registrasi", async () => {
    renderWithProviders(<RegisterPage />);

    mocks.authRegister.fulfilled.match.mockReturnValue(
      true
    );

    mocks.dispatch.mockResolvedValue({
      type: "auth/register/fulfilled",
    });

    fillValidForm();

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(mocks.dispatch).toHaveBeenCalled();
    });

    expect(mocks.authRegister).toHaveBeenCalledWith({
      name: "Feny Rika Pasaribu",
      email: "feny@example.com",
      password: "password123",
    });

    expect(
      mocks.showSuccessDialog
    ).toHaveBeenCalledWith(
      "Registrasi berhasil",
      "Akun berhasil dibuat. Silakan masuk menggunakan akun kamu."
    );

    expect(mocks.replace).toHaveBeenCalledWith(
      "/auth/login"
    );
  });

  it("menangani registrasi yang gagal dengan pesan error dari state", async () => {
    mocks.selector.mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          auth: {
            isAuthRegister: false,
            error: "Email sudah digunakan.",
          },
        })
    );

    renderWithProviders(<RegisterPage />);

    mocks.authRegister.fulfilled.match.mockReturnValue(
      false
    );

    mocks.dispatch.mockResolvedValue({
      type: "auth/register/rejected",
    });

    fillValidForm();

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Registrasi gagal",
        "Email sudah digunakan."
      );
    });

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("menangani registrasi gagal tanpa pesan error", async () => {
    mocks.selector.mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          auth: {
            isAuthRegister: false,
            error: null,
          },
        })
    );

    renderWithProviders(<RegisterPage />);

    mocks.authRegister.fulfilled.match.mockReturnValue(
      false
    );

    mocks.dispatch.mockResolvedValue({
      type: "auth/register/rejected",
    });

    fillValidForm();

    fireEvent.submit(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(
        mocks.showErrorDialog
      ).toHaveBeenCalledWith(
        "Registrasi gagal",
        "Terjadi kesalahan saat membuat akun."
      );
    });

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("menampilkan loading ketika registrasi sedang diproses", () => {
    mocks.selector.mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          auth: {
            isAuthRegister: true,
            error: null,
          },
        })
    );

    renderWithProviders(<RegisterPage />);

    expect(
      screen.getByRole("button", {
        name: "Mendaftarkan...",
      })
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Nama")
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Email")
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Password", {
        exact: true,
      })
    ).toBeDisabled();

    expect(
      screen.getByLabelText(
        "Konfirmasi Password",
        {
          exact: true,
        }
      )
    ).toBeDisabled();
  });
});
