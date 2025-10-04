// src/tests/ProtectedRoute.test.js
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import CovidCrud from "../pages/CovidCrud";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders children when token exists", () => {
    localStorage.setItem("token", "fake-token");

    render(
      <MemoryRouter initialEntries={["/covid"]}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  test("redirects to login when no token exists", () => {
    render(
      <MemoryRouter initialEntries={["/covid"]}>
        <ProtectedRoute>
          <CovidCrud />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText(/covid crud dashboard/i)).not.toBeInTheDocument();
  });
});
