import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { apiFetch } from "@/helpers/apiHelper";

import {
  login,
  register,
  type LoginResponse,
  type RegisterResponse,
} from "@/features/auth/api/authApi";

vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

describe("authApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("mengirim request login dengan email dan password", async () => {
      const response: LoginResponse = {
        status: "success",
        message: "Login berhasil",
        data: {
          user: {
            id: 1,
            name: "Feny",
            email: "feny@example.com",
            email_verified_at: null,
            created_at: "2026-01-01T00:00:00.000000Z",
            updated_at: "2026-01-01T00:00:00.000000Z",
          },
          token: "token-123",
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await login({
        email: "feny@example.com",
        password: "password123",
      });

      expect(result).toEqual(response);

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: "feny@example.com",
            password: "password123",
          }),
        }
      );
    });

    it("meneruskan error dari apiFetch", async () => {
      vi.mocked(apiFetch).mockRejectedValue(
        new Error("Email atau password salah")
      );

      await expect(
        login({
          email: "salah@example.com",
          password: "password-salah",
        })
      ).rejects.toThrow("Email atau password salah");

      expect(apiFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("register", () => {
    it("mengirim request register dengan data pengguna", async () => {
      const response: RegisterResponse = {
        status: "success",
        message: "Registrasi berhasil",
      };

      vi.mocked(apiFetch).mockResolvedValue(response);

      const result = await register({
        name: "Feny Pasaribu",
        email: "feny@example.com",
        password: "password123",
      });

      expect(result).toEqual(response);

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: "Feny Pasaribu",
            email: "feny@example.com",
            password: "password123",
          }),
        }
      );
    });

    it("meneruskan error dari apiFetch", async () => {
      vi.mocked(apiFetch).mockRejectedValue(
        new Error("Email sudah digunakan")
      );

      await expect(
        register({
          name: "Feny",
          email: "feny@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Email sudah digunakan");

      expect(apiFetch).toHaveBeenCalledTimes(1);
    });
  });
});