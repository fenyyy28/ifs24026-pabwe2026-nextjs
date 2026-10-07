import Swal from "sweetalert2";

export function showSuccessDialog(
  title: string,
  message?: string
): Promise<unknown> {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: "OK",
  });
}

export function showErrorDialog(
  title: string,
  message?: string
): Promise<unknown> {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "OK",
  });
}

export function showWarningDialog(
  title: string,
  message?: string
): Promise<unknown> {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
  });
}

export function showConfirmDialog(
  title: string,
  message?: string
): Promise<boolean> {
  return Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  }).then((result) => result.isConfirmed);
}

export function formatDate(
  date: string | Date,
  includeTime = true
): string {
  const dateObject = new Date(date);

  if (Number.isNaN(dateObject.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(dateObject);
}