import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import AuthLayout from "@/features/auth/layouts/AuthLayout";

describe("AuthLayout", () => {
  it("menampilkan judul dan description", () => {
    render(
      <AuthLayout
        title="Masuk ke akun"
        description="Masukkan email dan password."
      >
        <div>Konten form</div>
      </AuthLayout>
    );

    expect(
      screen.getByRole("heading", {
        name: "Masuk ke akun",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Masukkan email dan password."
      )
    ).toBeInTheDocument();
  });

  it("menampilkan children di dalam layout", () => {
    render(
      <AuthLayout
        title="Buat akun"
        description="Daftarkan akun baru."
      >
        <form aria-label="Form registrasi">
          <input
            aria-label="Nama"
            placeholder="Nama lengkap"
          />

          <button type="submit">
            Daftar
          </button>
        </form>
      </AuthLayout>
    );

    expect(
      screen.getByRole("form", {
        name: "Form registrasi",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Nama",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Daftar",
      })
    ).toBeInTheDocument();
  });

  it("menampilkan teks branding Delcom Posts", () => {
    render(
      <AuthLayout
        title="Login"
        description="Silakan masuk."
      >
        <div>Form login</div>
      </AuthLayout>
    );

    expect(
      screen.getAllByText("Delcom Posts")
    ).toHaveLength(2);
  });
});