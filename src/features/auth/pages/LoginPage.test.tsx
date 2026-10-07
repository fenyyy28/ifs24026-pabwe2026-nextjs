import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import LoginPage from "@/features/auth/pages/LoginPage";

const {
  mockReplace,
  mockDispatch,
  mockShowErrorDialog,
  mockShowSuccessDialog,
  mockAuthLogin,
  getMockIsAuthLogin,
  setMockIsAuthLogin,
  getMockLoginResult,
  setMockLoginResult,
} = vi.hoisted(() => {
  let isAuthLogin = false;

  let loginResult: {
    type: string;
    payload?: unknown;
  } = {
    type: "auth/login/fulfilled",
    payload: {
      user: {
        id: 1,
        name: "Feny",
      },
      token: "token",
    },
  };

  return {
    mockReplace: vi.fn(),
    mockDispatch: vi.fn(),
    mockShowErrorDialog: vi.fn(),
    mockShowSuccessDialog: vi.fn(),
    mockAuthLogin: vi.fn(),

    getMockIsAuthLogin: () => isAuthLogin,

    setMockIsAuthLogin: (value: boolean) => {
      isAuthLogin = value;
    },

    getMockLoginResult: () => loginResult,

    setMockLoginResult: (value: {
      type: string;
      payload?: unknown;
    }) => {
      loginResult = value;
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: "a",
}));

vi.mock("@/features/auth/layouts/AuthLayout", () => ({
  default: "div",
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mockDispatch,

  useAppSelector: (
    selector: (state: {
      auth: {
        isAuthLogin: boolean;
      };
    }) => unknown
  ) =>
    selector({
      auth: {
        isAuthLogin: getMockIsAuthLogin(),
      },
    }),
}));

vi.mock("@/features/auth/states/reducer", () => {
  const authLogin = Object.assign(
    (data: {
      email: string;
      password: string;
    }) => {
      mockAuthLogin(data);

      return async () => getMockLoginResult();
    },
    {
      fulfilled: {
        match: (result: { type: string }) =>
          result.type === "auth/login/fulfilled",
      },
    }
  );

  return {
    authLogin,
  };
});

vi.mock("@/helpers/toolsHelper", () => ({
  showErrorDialog: mockShowErrorDialog,
  showSuccessDialog: mockShowSuccessDialog,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setMockIsAuthLogin(false);

    setMockLoginResult({
      type: "auth/login/fulfilled",
      payload: {
        user: {
          id: 1,
          name: "Feny",
        },
        token: "token",
      },
    });

    mockDispatch.mockImplementation(
      async (thunk: () => Promise<unknown>) =>
        thunk()
    );

    mockShowErrorDialog.mockResolvedValue(undefined);

    mockShowSuccessDialog.mockResolvedValue(undefined);
  });

  it("menampilkan form login", () => {
    render(<LoginPage />);

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Masuk",
      })
    ).toBeInTheDocument();
  });

  it("menampilkan link menuju halaman register", () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole(
      "link",
      {
        name: "Daftar sekarang",
      }
    );

    expect(registerLink).toBeInTheDocument();

    expect(registerLink).toHaveAttribute(
      "href",
      "/auth/register"
    );
  });

  it("mengisi email dan password", () => {
    render(<LoginPage />);

    const emailInput =
      screen.getByLabelText(
        "Email"
      ) as HTMLInputElement;

    const passwordInput =
      screen.getByLabelText(
        "Password"
      ) as HTMLInputElement;

    fireEvent.change(emailInput, {
      target: {
        value: "feny@example.com",
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: "password123",
      },
    });

    expect(emailInput.value).toBe(
      "feny@example.com"
    );

    expect(passwordInput.value).toBe(
      "password123"
    );
  });

  it("menampilkan error jika email kosong", async () => {
    render(<LoginPage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      })
    );

    await waitFor(() => {
      expect(
        mockShowErrorDialog
      ).toHaveBeenCalledWith(
        "Email belum diisi",
        "Silakan masukkan email kamu."
      );
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("menampilkan error jika password kosong", async () => {
    render(<LoginPage />);

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      })
    );

    await waitFor(() => {
      expect(
        mockShowErrorDialog
      ).toHaveBeenCalledWith(
        "Password belum diisi",
        "Silakan masukkan password kamu."
      );
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("berhasil login dan mengarahkan ke halaman utama", async () => {
    render(<LoginPage />);

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "  feny@example.com  ",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      })
    );

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith({
        email: "feny@example.com",
        password: "password123",
      });
    });

    expect(
      mockShowSuccessDialog
    ).toHaveBeenCalledWith(
      "Login berhasil",
      "Selamat datang kembali!"
    );

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("menampilkan pesan error dari response login", async () => {
    setMockLoginResult({
      type: "auth/login/rejected",
      payload: "Akun tidak ditemukan.",
    });

    render(<LoginPage />);

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      })
    );

    await waitFor(() => {
      expect(
        mockShowErrorDialog
      ).toHaveBeenCalledWith(
        "Login gagal",
        "Akun tidak ditemukan."
      );
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error default jika response bukan string", async () => {
    setMockLoginResult({
      type: "auth/login/rejected",
      payload: {
        message: "Unauthorized",
      },
    });

    render(<LoginPage />);

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "feny@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      })
    );

    await waitFor(() => {
      expect(
        mockShowErrorDialog
      ).toHaveBeenCalledWith(
        "Login gagal",
        "Email atau password tidak sesuai."
      );
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("menampilkan tombol Memproses ketika login sedang berlangsung", () => {
    setMockIsAuthLogin(true);

    render(<LoginPage />);

    const button = screen.getByRole(
      "button",
      {
        name: "Memproses...",
      }
    );

    expect(button).toBeInTheDocument();

    expect(button).toBeDisabled();
  });
});