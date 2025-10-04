import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE = "http://127.0.0.1:5001"; // Week3 Flask backend for auth/CRUD
  const SOCIAL_API_BASE = "http://127.0.0.1:5000"; // Week2 Flask backend for Google/LinkedIn

  //handle token returned from Week2 (Google/LinkedIn)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      setUserInfo(decoded);
      localStorage.setItem("user", JSON.stringify(decoded));
      navigate("/covid");
    }
  }, [location, navigate]);

  // username/password registration
  const handleRegister = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        username,
        password,
      });
      alert(res.data.msg);
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  //username/password Login
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password,
      });

      const token = res.data.access_token;
      localStorage.setItem("token", token);

      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
        localStorage.setItem("user", JSON.stringify(decoded));
      } catch (err) {
        console.error("Error decoding token", err);
      }

      alert("Login successful");
      navigate("/covid");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login / Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>

      <div style={{ marginTop: "1rem" }}>
        <h3>Or login with:</h3>
        <a href={`${SOCIAL_API_BASE}/login/google`}>
          <button>Login with Google</button>
        </a>
        <a href={`${SOCIAL_API_BASE}/login/linkedin`} style={{ marginLeft: "10px" }}>
          <button>Login with LinkedIn</button>
        </a>
      </div>

      {userInfo && (
        <div style={{ marginTop: "1rem", color: "green" }}>
          <p>✅ Logged in as: {userInfo.id}</p>
          <p>🔑 Role: {userInfo.role}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
