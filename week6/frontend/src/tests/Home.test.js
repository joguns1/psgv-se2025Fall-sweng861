import { render, screen } from "@testing-library/react";
import Home from "../pages/Home";

describe("Home Component", () => {
  test("renders the heading", () => {
    render(<Home />);
    expect(
      screen.getByText(/Welcome to Week 4 Assignment - Frontend Development/i)
    ).toBeInTheDocument();
  });

  test("renders the paragraph", () => {
    render(<Home />);
    expect(
      screen.getByText(/Use the menu to log in and test CRUD operations./i)
    ).toBeInTheDocument();
  });
});
