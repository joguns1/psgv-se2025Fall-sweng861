import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CovidCrud from "./pages/CovidCrud";
import ProtectedRoute from "./components/ProtectedRoute";
import Callback from "./pages/Callback"; 

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/login">Login</Link> | 
        <Link to="/covid">COVID CRUD</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} /> 
        <Route element={<ProtectedRoute />}>
          <Route path="/covid" element={<CovidCrud />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
