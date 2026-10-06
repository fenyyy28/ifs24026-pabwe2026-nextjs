import { describe, expect, it, vi, beforeEach } from "vitest";
import reducer, {
  fetchUsers,
  fetchProfile,
  changeProfile,
  changeProfilePhoto,
  changeProfilePassword,
} from "./reducer";

import {
  getUsers,
  getMyProfile,
  updateProfile,
  updateProfilePhoto,
  changeProfilePassword as changeProfilePasswordApi,
} from "@/features/users/api/userApi";

vi.mock("@/features/users/api/userApi", () => ({
  getUsers: vi.fn(),
  getMyProfile: vi.fn(),
  updateProfile: vi.fn(),
  updateProfilePhoto: vi.fn(),
  changeProfilePassword: vi.fn(),
}));

const user = {
  id: 1,
  name: "Feny Pasaribu",
  email: "feny@gmail.com",
  email_verified_at: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

const profile = {
  ...user,
  bio: "Mahasiswa Informatika",
  photo: null,
};

const initialState = {
  users: [],
  user: null,
  profile: null,
  isProfile: false,
  isChangeProfile: false,
  isChangeProfilePhoto: false,
  isChangeProfilePassword: false,
  error: null,
};

describe("users reducer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("menggunakan initial state", () => {
      const state = reducer(undefined, { type: "unknown" });

      expect(state).toEqual(initialState);
    });
  });

  describe("fetchUsers", () => {
    it("berhasil mengambil users", async () => {
      vi.mocked(getUsers).mockResolvedValue({
        status: "success",
        message: "Berhasil",
        data: [user],
      });

      const dispatch = vi.fn();

      const thunk = fetchUsers();

      const result = await thunk(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/getUsers/fulfilled");
      expect(result.payload).toEqual([user]);
      expect(getUsers).toHaveBeenCalledTimes(1);
    });

    it("mengembalikan error dari Error object", async () => {
      vi.mocked(getUsers).mockRejectedValue(
        new Error("Gagal mengambil users")
      );

      const dispatch = vi.fn();

      const result = await fetchUsers()(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/getUsers/rejected");
      expect(result.payload).toBe("Gagal mengambil users");
    });

    it("mengembalikan pesan default untuk error non-Error", async () => {
      vi.mocked(getUsers).mockRejectedValue("error biasa");

      const dispatch = vi.fn();

      const result = await fetchUsers()(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/getUsers/rejected");
      expect(result.payload).toBe(
        "Gagal mengambil data pengguna."
      );
    });

    it("menangani pending", () => {
      const state = reducer(
        {
          ...initialState,
          error: "error sebelumnya",
        },
        fetchUsers.pending("request-1")
      );

      expect(state.error).toBeNull();
    });

    it("menangani fulfilled", () => {
      const state = reducer(
        {
          ...initialState,
          error: "error sebelumnya",
        },
        fetchUsers.fulfilled([user], "request-1")
      );

      expect(state.users).toEqual([user]);
      expect(state.error).toBeNull();
    });

    it("menangani rejected", () => {
      const state = reducer(
        initialState,
        fetchUsers.rejected(
          new Error("error"),
          "request-1",
          undefined,
          "Gagal mengambil users"
        )
      );

      expect(state.error).toBe("Gagal mengambil users");
    });
  });

  describe("fetchProfile", () => {
    it("berhasil mengambil profile", async () => {
      vi.mocked(getMyProfile).mockResolvedValue({
        status: "success",
        message: "Berhasil",
        data: {
          user: profile,
        },
      });

      const dispatch = vi.fn();

      const result = await fetchProfile()(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/getProfile/fulfilled");
      expect(result.payload).toEqual(profile);
    });

    it("mengembalikan error dari Error object", async () => {
      vi.mocked(getMyProfile).mockRejectedValue(
        new Error("Profile gagal")
      );

      const dispatch = vi.fn();

      const result = await fetchProfile()(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/getProfile/rejected");
      expect(result.payload).toBe("Profile gagal");
    });

    it("mengembalikan pesan default untuk error non-Error", async () => {
      vi.mocked(getMyProfile).mockRejectedValue("error biasa");

      const dispatch = vi.fn();

      const result = await fetchProfile()(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/getProfile/rejected");
      expect(result.payload).toBe(
        "Gagal mengambil profil pengguna."
      );
    });

    it("menangani pending", () => {
      const state = reducer(
        {
          ...initialState,
          error: "error sebelumnya",
        },
        fetchProfile.pending("request-2")
      );

      expect(state.isProfile).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menangani fulfilled", () => {
      const state = reducer(
        {
          ...initialState,
          isProfile: true,
          error: "error sebelumnya",
        },
        fetchProfile.fulfilled(profile, "request-2")
      );

      expect(state.isProfile).toBe(false);
      expect(state.profile).toEqual(profile);
      expect(state.user).toEqual(profile);
      expect(state.error).toBeNull();
    });

    it("menangani rejected", () => {
      const state = reducer(
        {
          ...initialState,
          isProfile: true,
        },
        fetchProfile.rejected(
          new Error("error"),
          "request-2",
          undefined,
          "Profile gagal"
        )
      );

      expect(state.isProfile).toBe(false);
      expect(state.error).toBe("Profile gagal");
    });
  });

  describe("changeProfile", () => {
    const payload = {
      name: "Feny Baru",
      bio: "Bio baru",
    };

    it("berhasil mengubah profile", async () => {
      vi.mocked(updateProfile).mockResolvedValue({
        status: "success",
        message: "Berhasil",
        data: {
          user: profile,
        },
      });

      const dispatch = vi.fn();

      const result = await changeProfile(payload)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/changeProfile/fulfilled");
      expect(result.payload).toEqual(profile);
      expect(updateProfile).toHaveBeenCalledWith(payload);
    });

    it("mengembalikan error dari Error object", async () => {
      vi.mocked(updateProfile).mockRejectedValue(
        new Error("Update profile gagal")
      );

      const dispatch = vi.fn();

      const result = await changeProfile(payload)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/changeProfile/rejected");
      expect(result.payload).toBe("Update profile gagal");
    });

    it("mengembalikan pesan default untuk error non-Error", async () => {
      vi.mocked(updateProfile).mockRejectedValue("error biasa");

      const dispatch = vi.fn();

      const result = await changeProfile(payload)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe("users/changeProfile/rejected");
      expect(result.payload).toBe(
        "Gagal memperbarui profil."
      );
    });

    it("menangani pending", () => {
      const state = reducer(
        {
          ...initialState,
          error: "error sebelumnya",
        },
        changeProfile.pending("request-3", payload)
      );

      expect(state.isChangeProfile).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menangani fulfilled", () => {
      const state = reducer(
        {
          ...initialState,
          isChangeProfile: true,
          error: "error sebelumnya",
        },
        changeProfile.fulfilled(profile, "request-3", payload)
      );

      expect(state.isChangeProfile).toBe(false);
      expect(state.profile).toEqual(profile);
      expect(state.user).toEqual(profile);
      expect(state.error).toBeNull();
    });

    it("menangani rejected", () => {
      const state = reducer(
        {
          ...initialState,
          isChangeProfile: true,
        },
        changeProfile.rejected(
          new Error("error"),
          "request-3",
          payload,
          "Update profile gagal"
        )
      );

      expect(state.isChangeProfile).toBe(false);
      expect(state.error).toBe("Update profile gagal");
    });
  });

  describe("changeProfilePhoto", () => {
    const file = new File(["photo"], "profile.jpg", {
      type: "image/jpeg",
    });

    it("berhasil mengubah foto profile", async () => {
      vi.mocked(updateProfilePhoto).mockResolvedValue({
        status: "success",
        message: "Berhasil",
        data: {
          user: profile,
        },
      });

      const dispatch = vi.fn();

      const result = await changeProfilePhoto(file)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe(
        "users/changeProfilePhoto/fulfilled"
      );
      expect(result.payload).toEqual(profile);
      expect(updateProfilePhoto).toHaveBeenCalledWith(file);
    });

    it("mengembalikan error dari Error object", async () => {
      vi.mocked(updateProfilePhoto).mockRejectedValue(
        new Error("Foto gagal")
      );

      const dispatch = vi.fn();

      const result = await changeProfilePhoto(file)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe(
        "users/changeProfilePhoto/rejected"
      );
      expect(result.payload).toBe("Foto gagal");
    });

    it("mengembalikan pesan default untuk error non-Error", async () => {
      vi.mocked(updateProfilePhoto).mockRejectedValue(
        "error biasa"
      );

      const dispatch = vi.fn();

      const result = await changeProfilePhoto(file)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe(
        "users/changeProfilePhoto/rejected"
      );
      expect(result.payload).toBe(
        "Gagal memperbarui foto profil."
      );
    });

    it("menangani pending", () => {
      const state = reducer(
        {
          ...initialState,
          error: "error sebelumnya",
        },
        changeProfilePhoto.pending("request-4", file)
      );

      expect(state.isChangeProfilePhoto).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menangani fulfilled", () => {
      const state = reducer(
        {
          ...initialState,
          isChangeProfilePhoto: true,
          error: "error sebelumnya",
        },
        changeProfilePhoto.fulfilled(profile, "request-4", file)
      );

      expect(state.isChangeProfilePhoto).toBe(false);
      expect(state.profile).toEqual(profile);
      expect(state.user).toEqual(profile);
      expect(state.error).toBeNull();
    });

    it("menangani rejected", () => {
      const state = reducer(
        {
          ...initialState,
          isChangeProfilePhoto: true,
        },
        changeProfilePhoto.rejected(
          new Error("error"),
          "request-4",
          file,
          "Foto gagal"
        )
      );

      expect(state.isChangeProfilePhoto).toBe(false);
      expect(state.error).toBe("Foto gagal");
    });
  });

  describe("changeProfilePassword", () => {
    const payload = {
      old_password: "password-lama",
      new_password: "password-baru",
    };

    it("berhasil mengubah password", async () => {
      const response = {
        status: "success",
        message: "Password berhasil diubah",
      };

      vi.mocked(changeProfilePasswordApi).mockResolvedValue(
        response
      );

      const dispatch = vi.fn();

      const result = await changeProfilePassword(payload)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe(
        "users/changeProfilePassword/fulfilled"
      );
      expect(result.payload).toEqual(response);
      expect(changeProfilePasswordApi).toHaveBeenCalledWith(
        payload
      );
    });

    it("mengembalikan error dari Error object", async () => {
      vi.mocked(changeProfilePasswordApi).mockRejectedValue(
        new Error("Password gagal")
      );

      const dispatch = vi.fn();

      const result = await changeProfilePassword(payload)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe(
        "users/changeProfilePassword/rejected"
      );
      expect(result.payload).toBe("Password gagal");
    });

    it("mengembalikan pesan default untuk error non-Error", async () => {
      vi.mocked(changeProfilePasswordApi).mockRejectedValue(
        "error biasa"
      );

      const dispatch = vi.fn();

      const result = await changeProfilePassword(payload)(
        dispatch,
        () => initialState,
        undefined
      );

      expect(result.type).toBe(
        "users/changeProfilePassword/rejected"
      );
      expect(result.payload).toBe(
        "Gagal mengubah password."
      );
    });

    it("menangani pending", () => {
      const state = reducer(
        {
          ...initialState,
          error: "error sebelumnya",
        },
        changeProfilePassword.pending("request-5", payload)
      );

      expect(state.isChangeProfilePassword).toBe(true);
      expect(state.error).toBeNull();
    });

    it("menangani fulfilled", () => {
      const state = reducer(
        {
          ...initialState,
          isChangeProfilePassword: true,
          error: "error sebelumnya",
        },
        changeProfilePassword.fulfilled(
          {
            status: "success",
            message: "Berhasil",
          },
          "request-5",
          payload
        )
      );

      expect(state.isChangeProfilePassword).toBe(false);
      expect(state.error).toBeNull();
    });

    it("menangani rejected", () => {
      const state = reducer(
        {
          ...initialState,
          isChangeProfilePassword: true,
        },
        changeProfilePassword.rejected(
          new Error("error"),
          "request-5",
          payload,
          "Password gagal"
        )
      );

      expect(state.isChangeProfilePassword).toBe(false);
      expect(state.error).toBe("Password gagal");
    });
  });
});