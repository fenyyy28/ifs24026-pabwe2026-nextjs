import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  login,
  register,
} from "@/features/auth/api/authApi";

import {
  authLogin,
  authLogout,
  authRegister,
} from "@/features/auth/states/reducer";

import {
  putAccessToken,
  removeAccessToken,
} from "@/helpers/apiHelper";

vi.mock("@/features/auth/api/authApi", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("@/helpers/apiHelper", () => ({
  putAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));

describe("auth actions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("authLogin", () => {
    it("berhasil melakukan login", async () => {
      const response = {
        status: "success",
        message: "Login berhasil",
        data: {
          user: {
            id: 1,
            name: "Feny",
            email: "feny@example.com",
            email_verified_at: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
          token: "token-login",
        },
      };

      vi.mocked(login).mockResolvedValue(response);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await authLogin({
        email: "feny@example.com",
        password: "password123",
      })(dispatch, getState, undefined);

      expect(result.type).toBe("auth/login/fulfilled");
      expect(result.payload).toEqual(response);

      expect(login).toHaveBeenCalledWith({
        email: "feny@example.com",
        password: "password123",
      });

      expect(putAccessToken).toHaveBeenCalledWith(
        "token-login"
      );
    });

    it("gagal melakukan login dan menggunakan rejectWithValue", async () => {
      vi.mocked(login).mockRejectedValue(
        new Error("Login gagal")
      );

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await authLogin({
        email: "feny@example.com",
        password: "password123",
      })(dispatch, getState, undefined);

      expect(result.type).toBe("auth/login/rejected");
      expect(result.payload).toBe("Login gagal");
    });

    it("menggunakan pesan default ketika error bukan instance Error", async () => {
      vi.mocked(login).mockRejectedValue("unknown error");

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await authLogin({
        email: "feny@example.com",
        password: "password123",
      })(dispatch, getState, undefined);

      expect(result.type).toBe("auth/login/rejected");
      expect(result.payload).toBe("Login gagal");
    });
  });

  describe("authRegister", () => {
    it("berhasil melakukan registrasi", async () => {
      const response = {
        status: "success",
        message: "Registrasi berhasil",
      };

      vi.mocked(register).mockResolvedValue(response);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await authRegister({
        name: "Feny Pasaribu",
        email: "feny@example.com",
        password: "password123",
      })(dispatch, getState, undefined);

      expect(result.type).toBe("auth/register/fulfilled");
      expect(result.payload).toEqual(response);

      expect(register).toHaveBeenCalledWith({
        name: "Feny Pasaribu",
        email: "feny@example.com",
        password: "password123",
      });
    });

    it("gagal melakukan registrasi", async () => {
      vi.mocked(register).mockRejectedValue(
        new Error("Email sudah digunakan")
      );

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await authRegister({
        name: "Feny",
        email: "feny@example.com",
        password: "password123",
      })(dispatch, getState, undefined);

      expect(result.type).toBe("auth/register/rejected");
      expect(result.payload).toBe(
        "Email sudah digunakan"
      );
    });

    it("menggunakan pesan default ketika error bukan instance Error", async () => {
      vi.mocked(register).mockRejectedValue(
        "unknown error"
      );

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await authRegister({
        name: "Feny",
        email: "feny@example.com",
        password: "password123",
      })(dispatch, getState, undefined);

      expect(result.type).toBe("auth/register/rejected");
      expect(result.payload).toBe("Registrasi gagal");
    });
  });

  describe("authLogout", () => {
    it("berhasil melakukan logout", async () => {
      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await authLogout()(
        dispatch,
        getState,
        undefined
      );

      expect(result.type).toBe("auth/logout/fulfilled");
      expect(result.payload).toBe(true);

      expect(removeAccessToken).toHaveBeenCalledTimes(1);
    });
  });
});