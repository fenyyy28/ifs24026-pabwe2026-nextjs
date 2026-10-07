import { act } from "react";
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

import { useInput } from "@/hooks/useInput";

describe("useInput", () => {
  it("menggunakan nilai awal", () => {
    const { result } = renderHook(() =>
      useInput("Feny")
    );

    expect(result.current.value).toBe("Feny");
  });

  it("mengubah nilai menggunakan setValue", () => {
    const { result } = renderHook(() =>
      useInput("Awal")
    );

    act(() => {
      result.current.setValue("Baru");
    });

    expect(result.current.value).toBe("Baru");
  });

  it("mengubah nilai melalui onChange pada input", () => {
    const { result } = renderHook(() =>
      useInput("")
    );

    const input = document.createElement("input");
    input.value = "Feny Rika Pasaribu";

    act(() => {
      result.current.onChange({
        target: input,
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe(
      "Feny Rika Pasaribu"
    );
  });

  it("mengubah nilai melalui onChange pada textarea", () => {
    const { result } = renderHook(() =>
      useInput("")
    );

    const textarea =
      document.createElement("textarea");

    textarea.value = "Deskripsi postingan";

    act(() => {
      result.current.onChange({
        target: textarea,
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.value).toBe(
      "Deskripsi postingan"
    );
  });

  it("mengubah nilai melalui onChange pada select", () => {
    const { result } = renderHook(() =>
      useInput("all")
    );

    const select = document.createElement("select");

    const option = document.createElement("option");
    option.value = "my-posts";
    option.textContent = "My Posts";

    select.appendChild(option);
    select.value = "my-posts";

    act(() => {
      result.current.onChange({
        target: select,
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.value).toBe("my-posts");
  });

  it("mendukung nilai awal bertipe number", () => {
    const { result } = renderHook(() =>
      useInput(10)
    );

    expect(result.current.value).toBe(10);

    act(() => {
      result.current.setValue(20);
    });

    expect(result.current.value).toBe(20);
  });
});