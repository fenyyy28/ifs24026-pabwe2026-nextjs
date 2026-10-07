import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { renderWithProviders } from "@/test-utils";
import NavbarComponent from "./NavbarComponent";

const mockReplace = vi.fn();
const mockDispatch = vi.fn();
const mockShowConfirmDialog = vi.fn();

let mockPathname = "/";

const mockState = {
  auth: {
    user: {
      name: "Feny Rika Pasaribu",
      email: "feny@example.com",
    },
  },
  users: {
    profile: null as {
      name: string;
      email: string;
      photo: string | null;
    } | null,
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: typeof mockState) => unknown
  ) => selector(mockState),
}));

vi.mock("@/features/auth/states/reducer", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/auth/states/reducer")
  >("@/features/auth/states/reducer");

  return {
    ...actual,
    authLogout: () => ({
      type: "auth/logout",
    }),
  };
});

vi.mock("@/helpers/toolsHelper", () => ({
  showConfirmDialog: (...args: unknown[]) =>
    mockShowConfirmDialog(...args),
}));

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPathname = "/";

    mockDispatch.mockResolvedValue({});
    mockShowConfirmDialog.mockResolvedValue(true);

    mockState.auth.user = {
      name: "Feny Rika Pasaribu",
      email: "feny@example.com",
    };

    mockState.users.profile = null;
  });

  it("menampilkan nama dan email user", () => {
    renderWithProviders(<NavbarComponent />);

    expect(
      screen.getByText("Feny Rika Pasaribu")
    ).toBeInTheDocument();

    expect(
      screen.getByText("feny@example.com")
    ).toBeInTheDocument();
  });

  it("menampilkan inisial user ketika tidak ada foto", () => {
    renderWithProviders(<NavbarComponent />);

    expect(screen.getByText("F")).toBeInTheDocument();
  });

  it("menampilkan foto profil ketika profile memiliki photo", () => {
    mockState.users.profile = {
      name: "Feny Profile",
      email: "profile@example.com",
      photo: "https://example.com/profile.jpg",
    };

    renderWithProviders(<NavbarComponent />);

    const image = screen.getByAltText(
      "Foto profil Feny Profile"
    );

    expect(image).toBeInTheDocument();

    expect(image).toHaveAttribute(
      "src",
      "https://example.com/profile.jpg"
    );
  });

  it("menggunakan data profile jika tersedia", () => {
    mockState.users.profile = {
      name: "Nama Profile",
      email: "profile@example.com",
      photo: null,
    };

    renderWithProviders(<NavbarComponent />);

    expect(
      screen.getByText("Nama Profile")
    ).toBeInTheDocument();

    expect(
      screen.getByText("profile@example.com")
    ).toBeInTheDocument();

    expect(
      screen.getByText("N")
    ).toBeInTheDocument();
  });

  it("menggunakan nama user jika nama profile kosong", () => {
    mockState.users.profile = {
      name: "",
      email: "profile@example.com",
      photo: null,
    };

    renderWithProviders(<NavbarComponent />);

    expect(
      screen.getByText("Feny Rika Pasaribu")
    ).toBeInTheDocument();

    expect(
      screen.getByText("profile@example.com")
    ).toBeInTheDocument();
  });

  it("menggunakan email user jika email profile kosong", () => {
    mockState.users.profile = {
      name: "Nama Profile",
      email: "",
      photo: null,
    };

    renderWithProviders(<NavbarComponent />);

    expect(
      screen.getByText("Nama Profile")
    ).toBeInTheDocument();

    expect(
      screen.getByText("feny@example.com")
    ).toBeInTheDocument();
  });

  it("menggunakan email kosong jika profile dan user tidak memiliki email", () => {
    mockState.users.profile = {
      name: "Nama Profile",
      email: "",
      photo: null,
    };

    mockState.auth.user = {
      name: "Feny",
      email: "",
    };

    renderWithProviders(<NavbarComponent />);

    expect(
      screen.getByText("Nama Profile")
    ).toBeInTheDocument();

    const emailElements = screen.getAllByText(
      (_content, element) =>
        element?.tagName.toLowerCase() === "p" &&
        element.textContent === ""
    );

    expect(emailElements.length).toBeGreaterThan(0);
  });

  it("membuka dropdown ketika tombol user diklik", () => {
    renderWithProviders(<NavbarComponent />);

    const button = screen.getByRole("button", {
      name: /feny rika pasaribu/i,
    });

    expect(button).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    fireEvent.click(button);

    expect(button).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    expect(
      screen.getByRole("menu")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("menuitem", {
        name: /Profil Saya/,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("menuitem", {
        name: /Keluar/,
      })
    ).toBeInTheDocument();
  });

  it("menutup dropdown ketika tombol user diklik lagi", () => {
    renderWithProviders(<NavbarComponent />);

    const button = screen.getByRole("button", {
      name: /feny rika pasaribu/i,
    });

    fireEvent.click(button);

    expect(
      screen.getByRole("menu")
    ).toBeInTheDocument();

    fireEvent.click(button);

    expect(
      screen.queryByRole("menu")
    ).not.toBeInTheDocument();
  });

  it("tidak menutup dropdown ketika klik masih di dalam dropdown", () => {
    renderWithProviders(<NavbarComponent />);

    const button = screen.getByRole("button", {
      name: /feny rika pasaribu/i,
    });

    fireEvent.click(button);

    const menu = screen.getByRole("menu");

    expect(menu).toBeInTheDocument();

    fireEvent.mouseDown(menu);

    expect(
      screen.getByRole("menu")
    ).toBeInTheDocument();
  });

  it("menutup dropdown ketika klik di luar dropdown", () => {
    renderWithProviders(<NavbarComponent />);

    const button = screen.getByRole("button", {
      name: /feny rika pasaribu/i,
    });

    fireEvent.click(button);

    expect(
      screen.getByRole("menu")
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(
      screen.queryByRole("menu")
    ).not.toBeInTheDocument();
  });

  it("menampilkan menu Profil Saya sebagai aktif ketika pathname /profile", () => {
    mockPathname = "/profile";

    renderWithProviders(<NavbarComponent />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /feny rika pasaribu/i,
      })
    );

    const profileLink = screen.getByRole("menuitem", {
      name: /Profil Saya/,
    });

    expect(profileLink).toHaveAttribute(
      "href",
      "/profile"
    );

    expect(profileLink.className).toContain(
      "bg-yellow-50"
    );

    expect(profileLink.className).toContain(
      "text-yellow-700"
    );
  });

  it("menutup dropdown ketika Profil Saya diklik", () => {
    renderWithProviders(<NavbarComponent />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /feny rika pasaribu/i,
      })
    );

    const profileLink = screen.getByRole("menuitem", {
      name: /Profil Saya/,
    });

    expect(profileLink).toHaveAttribute(
      "href",
      "/profile"
    );

    fireEvent.click(profileLink);

    expect(
      screen.queryByRole("menu")
    ).not.toBeInTheDocument();
  });

  it("logout tidak melakukan navigasi jika konfirmasi dibatalkan", async () => {
    mockShowConfirmDialog.mockResolvedValue(false);

    renderWithProviders(<NavbarComponent />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /feny rika pasaribu/i,
      })
    );

    fireEvent.click(
      screen.getByRole("menuitem", {
        name: /Keluar/,
      })
    );

    await waitFor(() => {
      expect(
        mockShowConfirmDialog
      ).toHaveBeenCalledWith(
        "Keluar dari akun?",
        "Kamu akan diarahkan kembali ke halaman login."
      );
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("logout melakukan dispatch dan redirect ketika dikonfirmasi", async () => {
    mockShowConfirmDialog.mockResolvedValue(true);

    renderWithProviders(<NavbarComponent />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /feny rika pasaribu/i,
      })
    );

    fireEvent.click(
      screen.getByRole("menuitem", {
        name: /Keluar/,
      })
    );

    await waitFor(() => {
      expect(
        mockShowConfirmDialog
      ).toHaveBeenCalledWith(
        "Keluar dari akun?",
        "Kamu akan diarahkan kembali ke halaman login."
      );
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "auth/logout",
      });
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/auth/login"
      );
    });
  });

  it("menggunakan fallback Pengguna jika user tidak tersedia", () => {
    mockState.auth.user = null as never;

    renderWithProviders(<NavbarComponent />);

    expect(
      screen.getByText("Pengguna")
    ).toBeInTheDocument();

    expect(
      screen.getByText("P")
    ).toBeInTheDocument();
  });

  it("menggunakan email kosong jika user tidak memiliki email", () => {
    mockState.auth.user = {
      name: "Feny",
      email: "",
    };

    renderWithProviders(<NavbarComponent />);

    expect(
      screen.getByText("Feny")
    ).toBeInTheDocument();
  });
});