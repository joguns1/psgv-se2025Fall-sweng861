import { useState, useEffect } from "react";
import axios from "axios";
import "./CovidCrud.css";

function CovidCrud() {
  const API_BASE = "http://127.0.0.1:5001"; // Flask backend
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState([]);
  const [formData, setFormData] = useState({
    country: "",
    cases: "",
    deaths: "",
    recovered: "",
    active: ""
  });
  const [editingId, setEditingId] = useState(null);

  // fretch saved COVID records
  const fetchSavedData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/covid`);
      setStats(res.data);
    } catch (err) {
      alert("❌ Error fetching saved records");
    }
  };

  // trigger live fetch
  const fetchLiveData = async () => {
    try {
      await axios.get(`${API_BASE}/covid/fetch`);
      alert("✅ Live data pulled and saved");
      fetchSavedData();
    } catch (err) {
      alert("❌ Error fetching live data");
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, []);

  // handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // add or update record
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/covid/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("✅ Record updated");
      } else {
        await axios.post(`${API_BASE}/covid`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("✅ Record added");
      }

      fetchSavedData();
      setFormData({ country: "", cases: "", deaths: "", recovered: "", active: "" });
      setEditingId(null);
    } catch (err) {
        console.error("Add error:", err.response || err);
        alert(err.response?.data?.error || err.response?.data?.msg || "❌ Error saving record");
    }
  };

  // prefill form for editing
  const startEditing = (stat) => {
    setFormData({
      country: stat.country,
      cases: stat.cases,
      deaths: stat.deaths,
      recovered: stat.recovered,
      active: stat.active
    });
    setEditingId(stat.id);
  };

  // Delete record (Admin only)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/covid/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Record deleted");
      fetchSavedData();
    } catch (err) {
      alert("❌ Error deleting record (need admin role?)");
    }
  };

  return (
    <div className="covid-dashboard">
      <h2>COVID CRUD Dashboard</h2>

      {/* Live fetch button */}
      <button className="fetch-btn" onClick={fetchLiveData}>
        🔄 Fetch Live Data (API → DB)
      </button>

      {/* Add / Update Form */}
      <div className="form-container">
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
        />
        <input
          type="number"
          name="cases"
          placeholder="Cases"
          value={formData.cases}
          onChange={handleChange}
        />
        <input
          type="number"
          name="deaths"
          placeholder="Deaths"
          value={formData.deaths}
          onChange={handleChange}
        />
        <input
          type="number"
          name="recovered"
          placeholder="Recovered"
          value={formData.recovered}
          onChange={handleChange}
        />
        <input
          type="number"
          name="active"
          placeholder="Active"
          value={formData.active}
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>
          {editingId ? "Update Record" : "Add Record"}
        </button>
      </div>

      {/* Display Records */}
      <h3>Saved Records</h3>
      <table className="covid-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Cases</th>
            <th>Deaths</th>
            <th>Recovered</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => (
            <tr key={stat.id}>
              <td>{stat.country}</td>
              <td>{stat.cases}</td>
              <td>{stat.deaths}</td>
              <td>{stat.recovered}</td>
              <td>{stat.active}</td>
              <td>
                <button
                  className="action-btn edit-btn"
                  onClick={() => startEditing(stat)}
                >
                 Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(stat.id)}
                >
                 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CovidCrud;
