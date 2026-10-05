import React from "react";
import {
  render,
  type RenderOptions,
} from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "@/store";

interface ExtendedRenderOptions
  extends Omit<RenderOptions, "wrapper"> {}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: ExtendedRenderOptions
) {
  return render(
    <Provider store={store}>
      {ui}
    </Provider>,
    options
  );
}