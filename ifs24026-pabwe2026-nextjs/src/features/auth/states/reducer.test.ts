import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  authLogin,
  authRegister,
  authLogout,
} from "@/features/auth/states/reducer";

import {
  login,
  register,
} from "@/features/auth/api/authApi";

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

describe("auth reducer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authLogin", () => {
    it("berhasil login", async () => {
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

      vi.mocked(login).mockResolvedValue(response);

      const dispatch = vi.fn();

      const result = await authLogin(
        {
          email: "feny@example.com",
          password: "password123",
        }
      )(dispatch, vi.fn(), undefined);

      expect(login).toHaveBeenCalledWith({
        email: "feny@example.com",
        password: "password123",
      });

      expect(putAccessToken).toHaveBeenCalledWith(
        "token-123"
      );

      expect(result.payload).toEqual(response);
    });

    it("gagal login dengan Error", async () => {
      vi.mocked(login).mockRejectedValue(
        new Error("Email atau password salah")
      );

      const dispatch = vi.fn();

      const result = await authLogin(
        {
          email: "feny@example.com",
          password: "password123",
        }
      )(dispatch, vi.fn(), undefined);

      expect(result.payload).toBe(
        "Email atau password salah"
      );
    });

    it("gagal login dengan error bukan Error", async () => {
      vi.mocked(login).mockRejectedValue("unknown error");

      const dispatch = vi.fn();

      const result = await authLogin(
        {
          email: "feny@example.com",
          password: "password123",
        }
      )(dispatch, vi.fn(), undefined);

      expect(result.payload).toBe("Login gagal");
    });
  });

  describe("authRegister", () => {
    it("berhasil register", async () => {
      const response = {
        status: "success",
        message: "Registrasi berhasil",
      };

      vi.mocked(register).mockResolvedValue(response);

      const dispatch = vi.fn();

      const result = await authRegister(
        {
          name: "Feny Pasaribu",
          email: "feny@example.com",
          password: "password123",
        }
      )(dispatch, vi.fn(), undefined);

      expect(register).toHaveBeenCalledWith({
        name: "Feny Pasaribu",
        email: "feny@example.com",
        password: "password123",
      });

      expect(result.payload).toEqual(response);
    });

    it("gagal register dengan Error", async () => {
      vi.mocked(register).mockRejectedValue(
        new Error("Email sudah digunakan")
      );

      const dispatch = vi.fn();

      const result = await authRegister(
        {
          name: "Feny Pasaribu",
          email: "feny@example.com",
          password: "password123",
        }
      )(dispatch, vi.fn(), undefined);

      expect(result.payload).toBe(
        "Email sudah digunakan"
      );
    });

    it("gagal register dengan error bukan Error", async () => {
      vi.mocked(register).mockRejectedValue("unknown error");

      const dispatch = vi.fn();

      const result = await authRegister(
        {
          name: "Feny Pasaribu",
          email: "feny@example.com",
          password: "password123",
        }
      )(dispatch, vi.fn(), undefined);

      expect(result.payload).toBe("Registrasi gagal");
    });
  });

  describe("authLogout", () => {
    it("berhasil logout", async () => {
      const dispatch = vi.fn();

      const result = await authLogout()(
        dispatch,
        vi.fn(),
        undefined
      );

      expect(removeAccessToken).toHaveBeenCalledTimes(1);
      expect(result.payload).toBe(true);
    });
  });

  describe("extraReducers", () => {
    const getReducer = async () => {
      const module = await import(
        "@/features/auth/states/reducer"
      );

      return module.default;
    };

    it("menangani login pending", async () => {
      const reducer = await getReducer();

      const state = reducer(undefined, {
        type: authLogin.pending.type,
      });

      expect(state.isAuthLogin).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menangani login fulfilled", async () => {
      const reducer = await getReducer();

      const payload = {
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

      const state = reducer(undefined, {
        type: authLogin.fulfilled.type,
        payload,
      });

      expect(state.isAuthLogin).toBe(false);
      expect(state.user).toEqual(payload.data.user);
      expect(state.token).toBe("token-123");
      expect(state.error).toBeNull();
    });

    it("menangani login rejected", async () => {
      const reducer = await getReducer();

      const state = reducer(undefined, {
        type: authLogin.rejected.type,
        payload: "Login gagal",
      });

      expect(state.isAuthLogin).toBe(false);
      expect(state.error).toBe("Login gagal");
    });

    it("menangani register pending", async () => {
      const reducer = await getReducer();

      const state = reducer(undefined, {
        type: authRegister.pending.type,
      });

      expect(state.isAuthRegister).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menangani register fulfilled", async () => {
      const reducer = await getReducer();

      const state = reducer(undefined, {
        type: authRegister.fulfilled.type,
        payload: {
          status: "success",
          message: "Registrasi berhasil",
        },
      });

      expect(state.isAuthRegister).toBe(false);
      expect(state.error).toBeNull();
    });

    it("menangani register rejected", async () => {
      const reducer = await getReducer();

      const state = reducer(undefined, {
        type: authRegister.rejected.type,
        payload: "Registrasi gagal",
      });

      expect(state.isAuthRegister).toBe(false);
      expect(state.error).toBe("Registrasi gagal");
    });

    it("menangani logout pending", async () => {
      const reducer = await getReducer();

      const state = reducer(undefined, {
        type: authLogout.pending.type,
      });

      expect(state.isAuthLogout).toBe(true);
    });

    it("menangani logout fulfilled", async () => {
      const reducer = await getReducer();

      const state = reducer(
        {
          user: {
            id: 1,
            name: "Feny Pasaribu",
            email: "feny@example.com",
            email_verified_at: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
          token: "token-123",
          isAuthLogin: false,
          isAuthRegister: false,
          isAuthLogout: true,
          error: "error",
        },
        {
          type: authLogout.fulfilled.type,
          payload: true,
        }
      );

      expect(state.isAuthLogout).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBeNull();
    });

    it("menangani logout rejected", async () => {
      const reducer = await getReducer();

      const state = reducer(undefined, {
        type: authLogout.rejected.type,
      });

      expect(state.isAuthLogout).toBe(false);
    });
  });
});