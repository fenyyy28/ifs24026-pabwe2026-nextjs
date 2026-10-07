import { describe, expect, it, vi, beforeEach } from "vitest";

import { apiFetch } from "@/helpers/apiHelper";
import { login, register } from "@/features/auth/api/authApi";

vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("berhasil melakukan login", async () => {
      const response = {
        status: "success",
        message: "Login berhasil",
        data: {
          user: {
            id: 1,
            name: "Feny Pasaribu",
            email: "feny@example.com",
            email_verified_at: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
          token: "token-123",
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const data = {
        email: "feny@example.com",
        password: "password123",
      };

      const result = await login(data);

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(response);
    });

    it("meneruskan error ketika login gagal", async () => {
      const error = new Error("Login gagal");

      vi.mocked(apiFetch).mockRejectedValue(error);

      const data = {
        email: "feny@example.com",
        password: "password123",
      };

      await expect(login(data)).rejects.toThrow("Login gagal");

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    });
  });

  describe("register", () => {
    it("berhasil melakukan register", async () => {
      const response = {
        status: "success",
        message: "Registrasi berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const data = {
        name: "Feny Pasaribu",
        email: "feny@example.com",
        password: "password123",
      };

      const result = await register(data);

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(response);
    });

    it("meneruskan error ketika register gagal", async () => {
      const error = new Error("Register gagal");

      vi.mocked(apiFetch).mockRejectedValue(error);

      const data = {
        name: "Feny Pasaribu",
        email: "feny@example.com",
        password: "password123",
      };

      await expect(register(data)).rejects.toThrow("Register gagal");

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    });
  });
});