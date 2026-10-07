import { useState } from "react";

export function useInput<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setValue(event.target.value as T);
  };

  return {
    value,
    setValue,
    onChange: handleChange,
  };
}