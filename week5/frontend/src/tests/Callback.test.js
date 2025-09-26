import { render, screen } from "@testing-library/react";
import Callback from "../pages/Callback";

describe("Callback Component", () => {
  test("renders the callback page message", () => {
    render(<Callback />);
    expect(
      screen.getByText(/callback/i)
    ).toBeInTheDocument();
  });
});

