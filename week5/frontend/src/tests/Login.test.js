import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// mock axios
jest.mock("axios");

// mock jwtDecode
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

// mock window.alert
window.alert = jest.fn();

describe("Login Page", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders login/register header and form fields", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/login \/ register/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test("renders Register and Login buttons", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^login$/i })
    ).toBeInTheDocument(); 
  });

  test("renders social login buttons", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("button", { name: /login with google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with linkedin/i })
    ).toBeInTheDocument();
  });

  test("allows typing into username and password fields", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  test("useEffect: handles token in URL and navigates", () => {
    const token = "fake-token";
    const decoded = { id: "123", role: "tester" };

    jwtDecode.mockReturnValue(decoded);
    delete window.location;
    window.location = { search: `?token=${token}` };

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(localStorage.getItem("token")).toBe(token);
    expect(localStorage.getItem("user")).toBe(JSON.stringify(decoded));
    expect(mockNavigate).toHaveBeenCalledWith("/covid");
  });

  test("handleRegister: success case shows alert", async () => {
    axios.post.mockResolvedValueOnce({ data: { msg: "Registered!" } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "pass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Registered!");
    });
  });

  test("handleRegister: error case shows fallback alert", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { msg: "fail" } } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("fail");
    });
  });

  test("renders user info when logged in", () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  // Manually simulate logged in state
  localStorage.setItem("user", JSON.stringify({ id: "u123", role: "admin" }));

  expect(screen.getByText(/✅ Logged in as/i)).toBeInTheDocument();
  expect(screen.getByText(/🔑 Role:/i)).toBeInTheDocument();
});


  test("handleLogin: success case saves token, decodes, and navigates", async () => {
    const token = "fake-login-token";
    const decoded = { id: "u1", role: "admin" };

    axios.post.mockResolvedValueOnce({ data: { access_token: token } });
    jwtDecode.mockReturnValue(decoded);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(token);
      expect(localStorage.getItem("user")).toBe(JSON.stringify(decoded));
      expect(window.alert).toHaveBeenCalledWith("Login successful");
      expect(mockNavigate).toHaveBeenCalledWith("/covid");
    });
  });

  test("handleLogin: error case shows fallback alert", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { msg: "bad login" } } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("bad login");
    });
  });
});
