import React from "react";
import {
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  dispatch: vi.fn(),
  getAccessToken: vi.fn(),
  fetchProfile: vi.fn(() => ({
    type: "users/fetchProfile",
  })),
  selectorState: {
    profile: null as unknown,
    isProfile: false,
    usersError: null as string | null,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/helpers/apiHelper", () => ({
  getAccessToken: mocks.getAccessToken,
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      users: {
        profile: mocks.selectorState.profile,
        isProfile: mocks.selectorState.isProfile,
        error: mocks.selectorState.usersError,
      },
    }),
}));

vi.mock("@/features/users/states/reducer", () => ({
  fetchProfile: mocks.fetchProfile,
}));

vi.mock("@/features/posts/components/NavbarComponent", () => ({
  default: () => (
    <nav data-testid="navbar">
      Navbar Component
    </nav>
  ),
}));

vi.mock("@/features/posts/components/SidebarComponent", () => ({
  default: () => (
    <aside data-testid="sidebar">
      Sidebar Component
    </aside>
  ),
}));

import PostLayout from "./PostLayout";

describe("PostLayout", () => {
  const children = (
    <div data-testid="page-content">
      Konten halaman
    </div>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getAccessToken.mockReturnValue("token-123");

    mocks.selectorState.profile = null;
    mocks.selectorState.isProfile = false;
    mocks.selectorState.usersError = null;

    mocks.dispatch.mockResolvedValue(undefined);
  });

  it("tidak menampilkan apa pun sebelum component selesai mount", () => {
    mocks.getAccessToken.mockReturnValue(null);

    const { container } = render(
      <PostLayout>{children}</PostLayout>
    );

    /*
     * useEffect dijalankan setelah render pertama.
     * Karena mounted awalnya false, render pertama harus null.
     */
    expect(container.firstChild).toBeNull();
  });

  it("redirect ke login ketika tidak memiliki access token", async () => {
    mocks.getAccessToken.mockReturnValue(null);

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(mocks.getAccessToken).toHaveBeenCalled();
      expect(mocks.replace).toHaveBeenCalledWith(
        "/auth/login"
      );
    });

    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("tidak menampilkan konten ketika tidak authenticated", async () => {
    mocks.getAccessToken.mockReturnValue(null);

    const { container } = render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(
        "/auth/login"
      );
    });

    expect(container.firstChild).toBeNull();
  });

  it("mengatur authenticated ketika access token tersedia", async () => {
    mocks.selectorState.profile = {
      id: 1,
      name: "Feny Pasaribu",
    };

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("navbar")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId("sidebar")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("page-content")
    ).toBeInTheDocument();

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("memanggil fetchProfile ketika profile belum tersedia", async () => {
    mocks.selectorState.profile = null;
    mocks.selectorState.isProfile = false;

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
     expect(mocks.fetchProfile).toHaveBeenCalled();
    });

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "users/fetchProfile",
    });
  });

  it("tidak memanggil fetchProfile ketika profile sudah tersedia", async () => {
    mocks.selectorState.profile = {
      id: 1,
      name: "Feny Pasaribu",
    };
    mocks.selectorState.isProfile = false;

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("navbar")
      ).toBeInTheDocument();
    });

    expect(mocks.fetchProfile).not.toHaveBeenCalled();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("tidak memanggil fetchProfile ketika profile sedang dimuat", async () => {
    mocks.selectorState.profile = null;
    mocks.selectorState.isProfile = true;

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Memuat akun...")
      ).toBeInTheDocument();
    });

    expect(mocks.fetchProfile).not.toHaveBeenCalled();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("menampilkan loading ketika authenticated tetapi profile belum tersedia", async () => {
    mocks.selectorState.profile = null;
    mocks.selectorState.isProfile = false;

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Memuat akun...")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Memuat akun...")
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("navbar")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId("sidebar")
    ).not.toBeInTheDocument();
  });

  it("menampilkan layout utama ketika profile tersedia", async () => {
    mocks.selectorState.profile = {
      id: 10,
      name: "Feny Pasaribu",
    };

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("page-content")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId("navbar")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("sidebar")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Konten halaman")
    ).toBeInTheDocument();
  });

  it("redirect ke login ketika terjadi error profile dan profile tidak tersedia", async () => {
    mocks.selectorState.profile = null;
    mocks.selectorState.isProfile = true;
    mocks.selectorState.usersError =
      "Gagal mengambil profile";

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(
        "/auth/login"
      );
    });
  });

  it("tidak redirect ketika error ada tetapi profile tersedia", async () => {
    mocks.selectorState.profile = {
      id: 1,
      name: "Feny Pasaribu",
    };
    mocks.selectorState.isProfile = true;
    mocks.selectorState.usersError =
      "Gagal mengambil profile";

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("navbar")
      ).toBeInTheDocument();
    });

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("tidak redirect ketika belum authenticated walaupun ada error", async () => {
    mocks.getAccessToken.mockReturnValue(null);
    mocks.selectorState.usersError =
      "Gagal mengambil profile";

    render(
      <PostLayout>{children}</PostLayout>
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(
        "/auth/login"
      );
    });
expect(mocks.replace).toHaveBeenCalledWith(
  "/auth/login"
);
  });

  it("mempertahankan children di dalam layout utama", async () => {
    mocks.selectorState.profile = {
      id: 1,
      name: "Feny Pasaribu",
    };

    render(
      <PostLayout>
        <section data-testid="custom-child">
          Halaman Posts
        </section>
      </PostLayout>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("custom-child")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Halaman Posts")
    ).toBeInTheDocument();
  });
});