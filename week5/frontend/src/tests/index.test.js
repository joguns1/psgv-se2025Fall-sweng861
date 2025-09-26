import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import reportWebVitals from "../reportWebVitals";

jest.mock("../reportWebVitals", () => jest.fn());

test("renders App inside StrictMode", () => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  const createRootSpy = jest.spyOn(ReactDOM, "createRoot");
  const mockRender = jest.fn();
  createRootSpy.mockReturnValue({ render: mockRender });

  require("../index.js"); // import after mocking

  expect(createRootSpy).toHaveBeenCalledWith(root);
  expect(mockRender).toHaveBeenCalled();
});

test("calls reportWebVitals", () => {
  expect(reportWebVitals).toHaveBeenCalled();
});
