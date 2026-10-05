import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  apiFetch,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "@/helpers/apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("menyimpan access token", () => {
    putAccessToken("token-123");

    expect(localStorage.getItem("access_token")).toBe(
      "token-123"
    );
  });

  it("mengambil access token", () => {
    localStorage.setItem(
      "access_token",
      "token-456"
    );

    expect(getAccessToken()).toBe("token-456");
  });

  it("mengembalikan null jika access token belum ada", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("menghapus access token", () => {
    localStorage.setItem(
      "access_token",
      "token-789"
    );

    removeAccessToken();

    expect(
      localStorage.getItem("access_token")
    ).toBeNull();
  });

  it("melakukan GET request dengan query parameter dan token", async () => {
    localStorage.setItem(
      "access_token",
      "token-get"
    );

    const mockResponse = {
      status: "success",
      message: "Berhasil",
      data: {
        name: "Feny",
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      })
    );

    const result = await apiFetch("/api/test", {
      method: "GET",
      query: {
        page: 1,
        active: true,
      },
    });

    expect(result).toEqual(mockResponse);

    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, options] = vi.mocked(fetch).mock
      .calls[0];

    expect(url).toContain(
      "/api/test?page=1&active=true"
    );

    expect(options?.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer token-get",
    });
  });

  it("mengirim JSON body", async () => {
    const mockResponse = {
      status: "success",
      message: "Data berhasil dibuat",
      data: {
        id: 1,
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      })
    );

    const body = {
      name: "Feny",
    };

    const result = await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(body),
    });

    expect(result).toEqual(mockResponse);

    const [, options] = vi.mocked(fetch).mock
      .calls[0];

    expect(options?.method).toBe("POST");
    expect(options?.body).toBe(
      JSON.stringify(body)
    );

    expect(options?.headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });

  it("mengirim FormData tanpa Content-Type JSON", async () => {
    const mockResponse = {
      status: "success",
      message: "Upload berhasil",
      data: {},
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      })
    );

    const formData = new FormData();

    formData.append(
      "photo",
      new File(["photo"], "photo.jpg", {
        type: "image/jpeg",
      })
    );

    const result = await apiFetch(
      "/api/users/photo",
      {
        method: "POST",
        body: formData,
      }
    );

    expect(result).toEqual(mockResponse);

    const [, options] = vi.mocked(fetch).mock
      .calls[0];

    expect(options?.body).toBe(formData);

    expect(
      (options?.headers as Record<string, string>)[
        "Content-Type"
      ]
    ).toBeUndefined();
  });

  it("melempar error ketika response tidak berhasil", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: vi.fn().mockResolvedValue({
          message: "Data tidak valid",
        }),
      })
    );

    await expect(
      apiFetch("/api/test")
    ).rejects.toThrow("Data tidak valid");
  });

  it("menggunakan pesan default jika response error tidak memiliki message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      })
    );

    await expect(
      apiFetch("/api/test")
    ).rejects.toThrow(
      "Request failed with status 500"
    );
  });

  it("tetap menggunakan pesan default jika response error bukan JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockRejectedValue(
          new Error("Invalid JSON")
        ),
      })
    );

    await expect(
      apiFetch("/api/test")
    ).rejects.toThrow(
      "Request failed with status 404"
    );
  });
});