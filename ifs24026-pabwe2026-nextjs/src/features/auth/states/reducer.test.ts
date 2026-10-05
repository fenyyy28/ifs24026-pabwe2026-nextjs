import { describe, expect, it } from "vitest";

import reducer, {
  authLogin,
  authLogout,
  authRegister,
} from "@/features/auth/states/reducer";

describe("auth reducer", () => {
  const initialState = {
    user: null,
    token: null,

    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,

    error: null,
  };

  const user = {
    id: 1,
    name: "Feny Pasaribu",
    email: "feny@example.com",
    email_verified_at: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };

  describe("initial state", () => {
    it("menggunakan state awal", () => {
      expect(reducer(undefined, { type: "unknown" })).toEqual(
        initialState
      );
    });
  });

  describe("authLogin", () => {
    it("mengatur loading ketika login pending", () => {
      const state = reducer(
        initialState,
        authLogin.pending("request-1", {
          email: "feny@example.com",
          password: "password123",
        })
      );

      expect(state.isAuthLogin).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menyimpan user dan token ketika login berhasil", () => {
      const state = reducer(
        {
          ...initialState,
          isAuthLogin: true,
        },
        authLogin.fulfilled(
          {
            status: "success",
            message: "Login berhasil",
            data: {
              user,
              token: "token-123",
            },
          },
          "request-1",
          {
            email: "feny@example.com",
            password: "password123",
          }
        )
      );

      expect(state.isAuthLogin).toBe(false);
      expect(state.user).toEqual(user);
      expect(state.token).toBe("token-123");
      expect(state.error).toBeNull();
    });

    it("menyimpan error ketika login gagal", () => {
      const state = reducer(
        {
          ...initialState,
          isAuthLogin: true,
        },
        authLogin.rejected(
          new Error("Login gagal"),
          "request-1",
          {
            email: "feny@example.com",
            password: "password123",
          },
          "Email atau password salah"
        )
      );

      expect(state.isAuthLogin).toBe(false);
      expect(state.error).toBe(
        "Email atau password salah"
      );
    });
  });

  describe("authRegister", () => {
    it("mengatur loading ketika register pending", () => {
      const state = reducer(
        initialState,
        authRegister.pending("request-2", {
          name: "Feny Pasaribu",
          email: "feny@example.com",
          password: "password123",
        })
      );

      expect(state.isAuthRegister).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menyelesaikan loading ketika register berhasil", () => {
      const state = reducer(
        {
          ...initialState,
          isAuthRegister: true,
        },
        authRegister.fulfilled(
          {
            status: "success",
            message: "Registrasi berhasil",
          },
          "request-2",
          {
            name: "Feny Pasaribu",
            email: "feny@example.com",
            password: "password123",
          }
        )
      );

      expect(state.isAuthRegister).toBe(false);
      expect(state.error).toBeNull();
    });

    it("menyimpan error ketika register gagal", () => {
      const state = reducer(
        {
          ...initialState,
          isAuthRegister: true,
        },
        authRegister.rejected(
          new Error("Registrasi gagal"),
          "request-2",
          {
            name: "Feny Pasaribu",
            email: "feny@example.com",
            password: "password123",
          },
          "Email sudah digunakan"
        )
      );

      expect(state.isAuthRegister).toBe(false);
      expect(state.error).toBe(
        "Email sudah digunakan"
      );
    });
  });

  describe("authLogout", () => {
    it("mengatur loading ketika logout pending", () => {
      const state = reducer(
        initialState,
        authLogout.pending("request-3")
      );

      expect(state.isAuthLogout).toBe(true);
    });

    it("menghapus user dan token ketika logout berhasil", () => {
      const state = reducer(
        {
          ...initialState,
          user,
          token: "token-123",
          error: "error sebelumnya",
        },
        authLogout.fulfilled(
          true,
          "request-3"
        )
      );

      expect(state.isAuthLogout).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBeNull();
    });

    it("menghentikan loading ketika logout gagal", () => {
      const state = reducer(
        {
          ...initialState,
          isAuthLogout: true,
        },
        authLogout.rejected(
          new Error("Logout gagal"),
          "request-3"
        )
      );

      expect(state.isAuthLogout).toBe(false);
    });
  });
});