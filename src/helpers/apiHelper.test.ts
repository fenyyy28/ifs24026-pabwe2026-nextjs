import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("menyimpan access token", () => {
    putAccessToken("token-123");

    expect(
      localStorage.getItem("access_token")
    ).toBe("token-123");
  });

  it("mengambil access token", () => {
    localStorage.setItem(
      "access_token",
      "token-456"
    );

    expect(getAccessToken()).toBe(
      "token-456"
    );
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

  it("mengembalikan null ketika window tidak tersedia", () => {
    vi.stubGlobal("window", undefined);

    expect(getAccessToken()).toBeNull();
  });

  it("tidak melakukan apa-apa ketika window tidak tersedia saat menyimpan token", () => {
    vi.stubGlobal("window", undefined);

    expect(() => {
      putAccessToken("token-node");
    }).not.toThrow();
  });

  it("tidak melakukan apa-apa ketika window tidak tersedia saat menghapus token", () => {
    vi.stubGlobal("window", undefined);

    expect(() => {
      removeAccessToken();
    }).not.toThrow();
  });

  it("melakukan GET request tanpa options", async () => {
    const mockResponse = {
      status: "success",
      message: "Berhasil",
      data: {},
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(
        mockResponse
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    const result = await apiFetch(
      "/api/test"
    );

    expect(result).toEqual(
      mockResponse
    );

    expect(
      mockFetch
    ).toHaveBeenCalledTimes(1);

    const [url, options] =
      mockFetch.mock.calls[0];

    expect(url).toContain(
      "/api/test"
    );

    expect(
      options?.headers
    ).toMatchObject({
      "Content-Type":
        "application/json",
    });
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

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(
        mockResponse
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    const result = await apiFetch(
      "/api/test",
      {
        method: "GET",
        query: {
          page: 1,
          active: true,
          empty: null,
          missing: undefined,
        },
      }
    );

    expect(result).toEqual(
      mockResponse
    );

    expect(
      mockFetch
    ).toHaveBeenCalledTimes(1);

    const [url, options] =
      mockFetch.mock.calls[0];

    expect(url).toContain(
      "/api/test?page=1&active=true"
    );

    expect(url).not.toContain(
      "empty"
    );

    expect(url).not.toContain(
      "missing"
    );

    expect(
      options?.headers
    ).toMatchObject({
      "Content-Type":
        "application/json",
      Authorization:
        "Bearer token-get",
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

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(
        mockResponse
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    const body = {
      name: "Feny",
    };

    const result = await apiFetch(
      "/api/users",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    expect(result).toEqual(
      mockResponse
    );

    const [, options] =
      mockFetch.mock.calls[0];

    expect(options?.method).toBe(
      "POST"
    );

    expect(options?.body).toBe(
      JSON.stringify(body)
    );

    expect(
      options?.headers
    ).toMatchObject({
      "Content-Type":
        "application/json",
    });
  });

  it("mengirim FormData tanpa Content-Type JSON", async () => {
    const mockResponse = {
      status: "success",
      message: "Upload berhasil",
      data: {},
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(
        mockResponse
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    const formData = new FormData();

    formData.append(
      "photo",
      new File(
        ["photo"],
        "photo.jpg",
        {
          type: "image/jpeg",
        }
      )
    );

    const result = await apiFetch(
      "/api/users/photo",
      {
        method: "POST",
        body: formData,
      }
    );

    expect(result).toEqual(
      mockResponse
    );

    const [, options] =
      mockFetch.mock.calls[0];

    expect(options?.body).toBe(
      formData
    );

    expect(
      (
        options?.headers as Record<
          string,
          string
        >
      )["Content-Type"]
    ).toBeUndefined();
  });

  it("menggunakan custom headers", async () => {
    const mockResponse = {
      status: "success",
      message: "Berhasil",
      data: {},
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(
        mockResponse
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    await apiFetch(
      "/api/custom",
      {
        method: "GET",
        headers: {
          "X-Test": "testing",
          Authorization:
            "Custom Authorization",
        },
      }
    );

    const [, options] =
      mockFetch.mock.calls[0];

    expect(
      options?.headers
    ).toMatchObject({
      "Content-Type":
        "application/json",
      "X-Test": "testing",
      Authorization:
        "Custom Authorization",
    });
  });

  it("tidak menambahkan Authorization jika token tidak tersedia", async () => {
    const mockResponse = {
      status: "success",
      message: "Berhasil",
      data: {},
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(
        mockResponse
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    localStorage.removeItem(
      "access_token"
    );

    await apiFetch(
      "/api/no-token"
    );

    const [, options] =
      mockFetch.mock.calls[0];

    expect(
      (
        options?.headers as Record<
          string,
          string
        >
      ).Authorization
    ).toBeUndefined();
  });

  it("melempar error ketika response tidak berhasil dengan message", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({
        message: "Data tidak valid",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      apiFetch("/api/test")
    ).rejects.toThrow(
      "Data tidak valid"
    );
  });

  it("menggunakan pesan default jika response error tidak memiliki message", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue(
        {}
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      apiFetch("/api/test")
    ).rejects.toThrow(
      "Request failed with status 500"
    );
  });

  it("tetap menggunakan pesan default jika response error bukan JSON", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockRejectedValue(
        new Error("Invalid JSON")
      ),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      apiFetch("/api/test")
    ).rejects.toThrow(
      "Request failed with status 404"
    );
  });
});