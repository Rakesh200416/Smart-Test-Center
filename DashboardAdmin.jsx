import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import "../dashboard.css";

export default function DashboardAdmin() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(res => setStats(res.data));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>🛠️ Admin Dashboard</h1>
        <p className="welcome">Welcome, <b>{user?.name}</b></p>

        {!stats ? (
          <p>Loading stats...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">👩‍🎓 Students<br /><b>{stats.studentsCount}</b></div>
            <div className="stat-card">👨‍🏫 Mentors<br /><b>{stats.mentorsCount}</b></div>
            <div className="stat-card">📝 Quizzes<br /><b>{stats.quizzesCount}</b></div>
            <div className="stat-card">⭐ Best Student<br /><b>{stats.bestStudent?.name || "N/A"}</b></div>
            <div className="stat-card">🏅 Best Mentor<br /><b>{stats.bestMentor?.name || "N/A"}</b></div>
          </div>
        )}
      </div>
    </div>
  );
}
