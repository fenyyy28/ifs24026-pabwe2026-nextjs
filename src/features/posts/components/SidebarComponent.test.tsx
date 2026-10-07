import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test-utils";
import SidebarComponent from "./SidebarComponent";

const mockPathname = vi.fn();
const mockSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams(),
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

describe("SidebarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPathname.mockReturnValue("/");
    mockSearchParams.mockReturnValue(
      new URLSearchParams()
    );
  });

  it("menampilkan semua menu sidebar", () => {
    renderWithProviders(<SidebarComponent />);

    expect(screen.getByText("All Posts")).toBeInTheDocument();
    expect(screen.getByText("My Posts")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("My Profile")).toBeInTheDocument();
  });

  it("menampilkan link All Posts dengan href yang benar", () => {
    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /all posts/i,
    });

    expect(link).toHaveAttribute("href", "/");
  });

  it("menampilkan link My Posts dengan href yang benar", () => {
    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /my posts/i,
    });

    expect(link).toHaveAttribute(
      "href",
      "/?is_me=1"
    );
  });

  it("menampilkan link Users dengan href yang benar", () => {
    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /users/i,
    });

    expect(link).toHaveAttribute(
      "href",
      "/users"
    );
  });

  it("menampilkan link My Profile dengan href yang benar", () => {
    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /my profile/i,
    });

    expect(link).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  it("memberikan status aktif pada All Posts ketika pathname adalah /", () => {
    mockPathname.mockReturnValue("/");

    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /all posts/i,
    });

    expect(link.className).toContain(
      "bg-yellow-100"
    );
  });

  it("memberikan status aktif pada My Posts ketika query is_me=1", () => {
    mockPathname.mockReturnValue("/");

    mockSearchParams.mockReturnValue(
      new URLSearchParams("is_me=1")
    );

    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /my posts/i,
    });

    expect(link.className).toContain(
      "bg-yellow-100"
    );
  });

  it("memberikan status aktif pada Users ketika pathname adalah /users", () => {
    mockPathname.mockReturnValue("/users");

    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /users/i,
    });

    expect(link.className).toContain(
      "bg-yellow-100"
    );
  });

  it("memberikan status aktif pada My Profile ketika pathname adalah /profile", () => {
    mockPathname.mockReturnValue("/profile");

    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /my profile/i,
    });

    expect(link.className).toContain(
      "bg-yellow-100"
    );
  });

  it("dapat mengklik menu My Posts", () => {
    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /my posts/i,
    });

    fireEvent.click(link);

    expect(link).toHaveAttribute(
      "href",
      "/?is_me=1"
    );
  });

  it("dapat mengklik menu Users", () => {
    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /users/i,
    });

    fireEvent.click(link);

    expect(link).toHaveAttribute(
      "href",
      "/users"
    );
  });

  it("dapat mengklik menu My Profile", () => {
    renderWithProviders(<SidebarComponent />);

    const link = screen.getByRole("link", {
      name: /my profile/i,
    });

    fireEvent.click(link);

    expect(link).toHaveAttribute(
      "href",
      "/profile"
    );
  });
});