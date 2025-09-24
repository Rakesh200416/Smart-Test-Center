import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { 
  User, Plus, BarChart3, FileText, Users, Edit3, Save, X, Mail, Phone, Building, Award, Camera, Search, Trophy, Target, Eye, Calendar
} from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import "../dashboard.css";

export default function DashboardMentor() {
  const { user, fetchMe } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stats, setStats] = useState({
    totalTests: 0,
    activeStudents: 0,
    completedExams: 0,
    totalAssignments: 0,
    totalNotifications: 0
  });

  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/mentor/stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Generate avatar preview
  useEffect(() => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(avatarFile);
    } else {
      setPreview(null);
    }
  }, [avatarFile]);

  // Get full avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `http://localhost:5003${avatar}`; // Adjust port/backend path if needed
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("mentor.")) {
      const key = name.split(".")[1];
      setForm({ ...form, mentor: { ...form.mentor, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Update profile including avatar
  const updateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);

      if (form.mentor) {
        formData.append("currentInstitution", form.mentor.currentInstitution || "");
        formData.append("phoneNumber", form.mentor.phoneNumber || "");
        formData.append("experience", form.mentor.experience || "");
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const { data } = await api.put("/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      setEditing(false);
      fetchMe();

      // Clear preview
      setAvatarFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  const dashboardActions = [
    { title: "Add Test", description: "Create new examinations", icon: <Plus />, path: "/add-test", color: "from-blue-500 to-blue-600" },
    { title: "Assignments", description: "Manage assignments", icon: <FileText />, path: "/mentor/assignments", color: "from-indigo-500 to-indigo-600" },
    { title: "Notifications", description: "Send notifications", icon: <Mail />, path: "/mentor/notifications", color: "from-pink-500 to-pink-600" },
    { title: "View Results", description: "See student performance", icon: <BarChart3 />, path: "/mentor/results", color: "from-green-500 to-green-600" }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Mentor Dashboard</h1>
          <p className="dashboard-subtitle">Manage your tests and track student progress</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { label: "Total Tests", value: stats.totalTests, icon: <FileText />, color: "bg-blue-500" },
          { label: "Active Students", value: stats.activeStudents, icon: <Users />, color: "bg-green-500" },
          { label: "Completed Exams", value: stats.completedExams, icon: <Award />, color: "bg-purple-500" },
          { label: "Assignments Given", value: stats.totalAssignments, icon: <FileText />, color: "bg-indigo-500" },
          { label: "Notifications Sent", value: stats.totalNotifications, icon: <Mail />, color: "bg-pink-500" }
        ].map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
          >
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-number">
                <CountUp end={stat.value} duration={1.5} />
              </h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard */}
      <div className="dashboard-main">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            {dashboardActions.map((action, index) => (
              <motion.div
                key={index}
                className="action-card-modern"
                onClick={() => navigate(action.path)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <div className={`action-icon bg-gradient-to-r ${action.color}`}>
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Profile Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Profile Information</h2>
          <div className="profile-card-modern">
            <div className="profile-header">
              <div className="avatar-container">
                <img
                  src={preview || getAvatarUrl(user?.avatar) || "/default-avatar.png"}
                  alt="Profile"
                  className="profile-avatar"
                />
                {editing && (
                  <label className="avatar-upload">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
              <div className="profile-info">
                <h3 className="profile-name">{user?.name || "Mentor"}</h3>
                <p className="profile-role">Senior Mentor</p>
              </div>
              {!editing && (
                <button className="edit-btn" onClick={()=>setEditing(true)}>
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>

            {!editing ? (
              <div className="profile-details">
                <div className="detail-item"><Mail className="w-5 h-5 text-gray-400" /><span className="detail-label">Email:</span><span className="detail-value">{user?.email || "Not provided"}</span></div>
                <div className="detail-item"><Building className="w-5 h-5 text-gray-400" /><span className="detail-label">Institution:</span><span className="detail-value">{user?.mentor?.currentInstitution || "Not provided"}</span></div>
                <div className="detail-item"><Phone className="w-5 h-5 text-gray-400" /><span className="detail-label">Phone:</span><span className="detail-value">{user?.mentor?.phoneNumber || "Not provided"}</span></div>
                <div className="detail-item"><Award className="w-5 h-5 text-gray-400" /><span className="detail-label">Experience:</span><span className="detail-value">{user?.mentor?.experience || "Not provided"}</span></div>
              </div>
            ) : (
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" value={form.name || ""} onChange={onChange} placeholder="Enter your full name" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input name="mentor.currentInstitution" value={form.mentor?.currentInstitution || ""} onChange={onChange} placeholder="Current institution" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="mentor.phoneNumber" value={form.mentor?.phoneNumber || ""} onChange={onChange} placeholder="Phone number" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input name="mentor.experience" value={form.mentor?.experience || ""} onChange={onChange} placeholder="Years of experience" className="form-input" />
                </div>
                <div className="form-actions">
                  <button className="btn-save" onClick={updateProfile}><Save className="w-4 h-4" /> Save Changes</button>
                  <button className="btn-cancel" onClick={()=>setEditing(false)}><X className="w-4 h-4" /> Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}