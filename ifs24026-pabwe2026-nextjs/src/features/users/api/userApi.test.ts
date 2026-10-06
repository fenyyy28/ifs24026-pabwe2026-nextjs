import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getUsers,
  getMyProfile,
  updateProfile,
  updateProfilePhoto,
  changeProfilePassword,
} from "./userApi";
import { apiFetch } from "@/helpers/apiHelper";

vi.mock("@/helpers/apiHelper", () => ({
  apiFetch: vi.fn(),
}));

describe("userApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("berhasil mengambil semua users", async () => {
      const mockResponse = {
        status: "success",
        message: "Users berhasil diambil",
        data: [
          {
            id: 1,
            name: "Feny",
            email: "feny@gmail.com",
            email_verified_at: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ],
      };

      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await getUsers();

      expect(apiFetch).toHaveBeenCalledWith("/api/v1/users");
      expect(result).toEqual(mockResponse);
    });

    it("meneruskan error saat mengambil users", async () => {
      const error = new Error("Gagal mengambil users");

      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(getUsers()).rejects.toThrow("Gagal mengambil users");
      expect(apiFetch).toHaveBeenCalledWith("/api/v1/users");
    });
  });

  describe("getMyProfile", () => {
    it("berhasil mengambil profile pengguna", async () => {
      const mockResponse = {
        status: "success",
        message: "Profile berhasil diambil",
        data: {
          user: {
            id: 1,
            name: "Feny",
            email: "feny@gmail.com",
            email_verified_at: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
            bio: "Mahasiswa Informatika",
            photo: null,
          },
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await getMyProfile();

      expect(apiFetch).toHaveBeenCalledWith("/api/v1/users/me");
      expect(result).toEqual(mockResponse);
    });

    it("meneruskan error saat mengambil profile", async () => {
      const error = new Error("Gagal mengambil profile");

      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(getMyProfile()).rejects.toThrow(
        "Gagal mengambil profile"
      );

      expect(apiFetch).toHaveBeenCalledWith("/api/v1/users/me");
    });
  });

  describe("updateProfile", () => {
    it("berhasil mengubah profile", async () => {
      const data = {
        name: "Feny Pasaribu",
        bio: "Mahasiswa Informatika",
      };

      const mockResponse = {
        status: "success",
        message: "Profile berhasil diperbarui",
        data: {
          user: {
            id: 1,
            name: "Feny Pasaribu",
            email: "feny@gmail.com",
            email_verified_at: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-02",
            bio: "Mahasiswa Informatika",
            photo: null,
          },
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await updateProfile(data);

      expect(apiFetch).toHaveBeenCalledWith("/api/v1/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      expect(result).toEqual(mockResponse);
    });

    it("meneruskan error saat update profile", async () => {
      const data = {
        name: "Feny",
        bio: "Informatika",
      };

      const error = new Error("Gagal update profile");

      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(updateProfile(data)).rejects.toThrow(
        "Gagal update profile"
      );

      expect(apiFetch).toHaveBeenCalledWith("/api/v1/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    });
  });

  describe("updateProfilePhoto", () => {
    it("berhasil mengubah foto profile", async () => {
      const file = new File(["foto"], "profile.jpg", {
        type: "image/jpeg",
      });

      const mockResponse = {
        status: "success",
        message: "Foto profile berhasil diperbarui",
        data: {
          user: {
            id: 1,
            name: "Feny",
            email: "feny@gmail.com",
            email_verified_at: null,
            created_at: "2026-01-01",
            updated_at: "2026-01-02",
            bio: "Mahasiswa Informatika",
            photo: "profile.jpg",
          },
        },
      };

      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await updateProfilePhoto(file);

      expect(apiFetch).toHaveBeenCalledTimes(1);

      const [url, options] = vi.mocked(apiFetch).mock.calls[0];

      expect(url).toBe("/api/v1/users/me/photo");
      expect(options).toBeDefined();
      expect(options?.method).toBe("POST");
      expect(options?.headers).toEqual({});
      expect(options?.body).toBeInstanceOf(FormData);

      const formData = options?.body as FormData;

      expect(formData.get("photo")).toBe(file);
      expect(result).toEqual(mockResponse);
    });

    it("meneruskan error saat update foto profile", async () => {
      const file = new File(["foto"], "profile.jpg", {
        type: "image/jpeg",
      });

      const error = new Error("Gagal update foto");

      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(updateProfilePhoto(file)).rejects.toThrow(
        "Gagal update foto"
      );

      expect(apiFetch).toHaveBeenCalledTimes(1);

      const [url, options] = vi.mocked(apiFetch).mock.calls[0];

      expect(url).toBe("/api/v1/users/me/photo");
      expect(options?.method).toBe("POST");
      expect(options?.headers).toEqual({});
      expect(options?.body).toBeInstanceOf(FormData);

      const formData = options?.body as FormData;

      expect(formData.get("photo")).toBe(file);
    });
  });

  describe("changeProfilePassword", () => {
    it("berhasil mengubah password profile", async () => {
      const data = {
        old_password: "password-lama",
        new_password: "password-baru",
      };

      const mockResponse = {
        status: "success",
        message: "Password berhasil diubah",
      };

      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await changeProfilePassword(data);

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/users/me/password",
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("meneruskan error saat mengubah password", async () => {
      const data = {
        old_password: "password-lama",
        new_password: "password-baru",
      };

      const error = new Error("Gagal mengubah password");

      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(changeProfilePassword(data)).rejects.toThrow(
        "Gagal mengubah password"
      );

      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/users/me/password",
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
    });
  });
});