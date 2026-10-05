import { DELCOM_BASEURL } from "@/lib/config";

type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

interface FetchOptions extends RequestInit {
  query?: QueryParams;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { query, headers, body, ...fetchOptions } = options;

  const url = new URL(endpoint, DELCOM_BASEURL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const token = getAccessToken();

  const isFormData = body instanceof FormData;

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    body,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

export function putAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("access_token", token);
}

export function removeAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("access_token");
}