import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import Swal from "sweetalert2";

import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
} from "@/helpers/toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("showSuccessDialog", () => {
    it("menampilkan dialog sukses", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: true,
      } as never);

      await showSuccessDialog(
        "Berhasil",
        "Data berhasil disimpan."
      );

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "success",
        title: "Berhasil",
        text: "Data berhasil disimpan.",
        confirmButtonText: "OK",
      });
    });

    it("tetap dapat digunakan tanpa message", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: true,
      } as never);

      await showSuccessDialog("Berhasil");

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "success",
        title: "Berhasil",
        text: undefined,
        confirmButtonText: "OK",
      });
    });
  });

  describe("showErrorDialog", () => {
    it("menampilkan dialog error", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: true,
      } as never);

      await showErrorDialog(
        "Gagal",
        "Terjadi kesalahan."
      );

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan.",
        confirmButtonText: "OK",
      });
    });

    it("tetap dapat digunakan tanpa message", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: true,
      } as never);

      await showErrorDialog("Gagal");

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "error",
        title: "Gagal",
        text: undefined,
        confirmButtonText: "OK",
      });
    });
  });

  describe("showWarningDialog", () => {
    it("menampilkan dialog peringatan", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: true,
      } as never);

      await showWarningDialog(
        "Peringatan",
        "Data belum lengkap."
      );

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "warning",
        title: "Peringatan",
        text: "Data belum lengkap.",
        confirmButtonText: "OK",
      });
    });

    it("tetap dapat digunakan tanpa message", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: true,
      } as never);

      await showWarningDialog("Peringatan");

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "warning",
        title: "Peringatan",
        text: undefined,
        confirmButtonText: "OK",
      });
    });
  });

  describe("showConfirmDialog", () => {
    it("mengembalikan true ketika pengguna memilih Ya", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: true,
      } as never);

      const result = await showConfirmDialog(
        "Hapus data?",
        "Data akan dihapus."
      );

      expect(result).toBe(true);

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "question",
        title: "Hapus data?",
        text: "Data akan dihapus.",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });
    });

    it("mengembalikan false ketika pengguna memilih Batal", async () => {
      vi.mocked(Swal.fire).mockResolvedValue({
        isConfirmed: false,
      } as never);

      const result = await showConfirmDialog(
        "Hapus data?"
      );

      expect(result).toBe(false);

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "question",
        title: "Hapus data?",
        text: undefined,
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });
    });
  });

  describe("formatDate", () => {
    it("memformat tanggal dengan waktu", () => {
      const result = formatDate(
        "2026-01-15T10:30:00"
      );

      expect(result).toContain("15");
      expect(result).toContain("Januari");
      expect(result).toContain("2026");
    });

    it("memformat tanggal tanpa waktu", () => {
      const result = formatDate(
        "2026-01-15T10:30:00",
        false
      );

      expect(result).toContain("15");
      expect(result).toContain("Januari");
      expect(result).toContain("2026");

      expect(result).not.toMatch(/\d{2}.\d{2}/);
    });

    it("menerima object Date", () => {
      const date = new Date(
        "2026-05-20T08:00:00"
      );

      const result = formatDate(date);

      expect(result).toContain("20");
      expect(result).toContain("Mei");
      expect(result).toContain("2026");
    });

    it("mengembalikan tanda strip untuk tanggal invalid", () => {
      const result = formatDate("tanggal-invalid");

      expect(result).toBe("-");
    });
  });
});