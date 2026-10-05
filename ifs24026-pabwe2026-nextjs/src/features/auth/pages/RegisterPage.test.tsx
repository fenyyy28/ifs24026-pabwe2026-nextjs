import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";

import { renderWithProviders } from "@/test-utils";
import RegisterPage from "@/features/auth/pages/RegisterPage";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
      screen.getByLabelText("Konfirmasi Password", {
        exact: true,
      })
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

  it("mengisi nama, email, dan password", () => {
    renderWithProviders(<RegisterPage />);

    const nameInput = screen.getByLabelText(
      "Nama"
    ) as HTMLInputElement;

    const emailInput = screen.getByLabelText(
      "Email"
    ) as HTMLInputElement;

    const passwordInput = screen.getByLabelText(
      "Password",
      {
        exact: true,
      }
    ) as HTMLInputElement;

    fireEvent.change(nameInput, {
      target: {
        value: "Feny Rika Pasaribu",
      },
    });

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

    expect(nameInput.value).toBe(
      "Feny Rika Pasaribu"
    );

    expect(emailInput.value).toBe(
      "feny@example.com"
    );

    expect(passwordInput.value).toBe(
      "password123"
    );
  });

  it("tidak mengirim form jika nama kosong", async () => {
    renderWithProviders(<RegisterPage />);

    const emailInput = screen.getByLabelText(
      "Email"
    );

    const passwordInput = screen.getByLabelText(
      "Password",
      {
        exact: true,
      }
    );

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

    fireEvent.click(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it("tidak mengirim form jika email kosong", async () => {
    renderWithProviders(<RegisterPage />);

    const nameInput = screen.getByLabelText(
      "Nama"
    );

    const passwordInput = screen.getByLabelText(
      "Password",
      {
        exact: true,
      }
    );

    fireEvent.change(nameInput, {
      target: {
        value: "Feny Rika Pasaribu",
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: "password123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it("tidak mengirim form jika password kosong", async () => {
    renderWithProviders(<RegisterPage />);

    const nameInput = screen.getByLabelText(
      "Nama"
    );

    const emailInput = screen.getByLabelText(
      "Email"
    );

    fireEvent.change(nameInput, {
      target: {
        value: "Feny Rika Pasaribu",
      },
    });

    fireEvent.change(emailInput, {
      target: {
        value: "feny@example.com",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Daftar",
      })
    );

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});