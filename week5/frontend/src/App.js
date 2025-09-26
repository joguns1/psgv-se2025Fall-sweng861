import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CovidCrud from "./pages/CovidCrud";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.sub || decoded); // depending on backend
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/login">Login</Link> | 
        <Link to="/covid">COVID CRUD</Link>

        {user && (
          <span style={{ marginLeft: "20px" }}>
            Logged in as: <strong>{user.name || user.username}</strong>{" "}
            ({user.email})
            <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
              Logout
            </button>
          </span>
        )}
      </nav>

      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />

  <Route
    path="/covid"
    element={
      <ProtectedRoute>
        <CovidCrud />
      </ProtectedRoute>
    }
  />
</Routes>

    </Router>
  );
}

export default App;
