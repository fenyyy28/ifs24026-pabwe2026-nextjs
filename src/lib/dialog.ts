"use client";

export async function showSuccessDialog(
  title: string,
  text: string
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  window.alert(`${title}\n\n${text}`);
}

export async function showErrorDialog(
  title: string,
  text: string
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  window.alert(`${title}\n\n${text}`);
}

export async function showConfirmDialog(
  title: string,
  text: string
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  return window.confirm(`${title}\n\n${text}`);
}