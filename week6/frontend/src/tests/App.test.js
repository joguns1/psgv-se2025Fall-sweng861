import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { jwtDecode } from "jwt-decode";

// mock jwtDecode to control decoding behavior
jest.mock("jwt-decode");

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  console.warn.mockRestore();
});


describe("App Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders Home page by default", () => {
    render(<App />);

    expect(
      screen.getByText(/welcome to week 4 assignment/i)
    ).toBeInTheDocument();
  });

  test("renders Login page on /login route", () => {
    render(<App />);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test("renders CovidCrud page on /covid route (ProtectedRoute still renders)", () => {
    render(<App />);

    expect(screen.getByText(/covid/i)).toBeInTheDocument();
  });

  test("shows user info when valid token is in localStorage", () => {
    const fakeUser = { name: "John Doe", email: "john@example.com" };
    localStorage.setItem("token", "fake-token");
    jwtDecode.mockReturnValue(fakeUser);

    render(<App />);


    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/\(john@example.com\)/i)).toBeInTheDocument();
  });

  test("logs error if token is invalid", () => {
    localStorage.setItem("token", "bad-token");
    jwtDecode.mockImplementation(() => {
      throw new Error("Invalid token");
    });
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);


    expect(spy).toHaveBeenCalledWith(
      "Invalid token",
      expect.any(Error)
    );
    spy.mockRestore();
  });

  test("logout removes token and hides user info", () => {
    const fakeUser = { username: "u1", email: "u1@example.com" };
    localStorage.setItem("token", "fake-token");
    jwtDecode.mockReturnValue(fakeUser);

    render(<App />);


    // ensure user is shown
    expect(screen.getByText(/logged in as:/i)).toBeInTheDocument();
    expect(screen.getByText(/\(u1@example\.com\)/i)).toBeInTheDocument();


    // click logout
    fireEvent.click(screen.getByText(/logout/i));

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.queryByText(/u1/i)).not.toBeInTheDocument();
  });
});
