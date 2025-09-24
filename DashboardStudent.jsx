import { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import {
  User,
  BarChart3,
  FileText,
  Award,
  Camera,
  Edit3,
  Save,
  X,
  GraduationCap,
  Mail,
  Phone,
  Building,
  Bell,
} from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import "./dashboard1.css";

export default function DashboardStudent() {
  const { user, fetchMe } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stats, setStats] = useState({
    totalTests: 0,
    completedExams: 0,
    avgScore: 0,
    attemptedTests: 0
  });

  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Sync form with user data
  useEffect(() => {
    if (user) setForm({ ...user, student: user.student || {} });
  }, [user]);

  // Preview avatar image when file selected
  useEffect(() => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(avatarFile);
    } else {
      setPreview(null);
    }
  }, [avatarFile]);

  // Helper to get avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `http://localhost:5002${avatar}`;
  };

  // Handle form input changes
  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("student.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        student: { ...prev.student, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Update profile API call
  const updateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name || "");
      formData.append("email", form.email || "");
      if (form.student) {
        formData.append("educationLevel", form.student.educationLevel || "");
        formData.append("institutionName", form.student.institutionName || "");
        formData.append("contactNumber", form.student.contactNumber || "");
      }
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await api.put("/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      setEditing(false);
      fetchMe();
      setAvatarFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      alert("Failed to update profile. Please try again.");
    }
  };

  // Fetch student stats
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/student/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Quick action cards
  const studentActions = [
    {
      title: "My Tests",
      description: "View and attempt available tests",
      icon: <FileText className="w-6 h-6" />,
      path: "/my-tests",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "My Scores",
      description: "Check your exam results & progress",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/my-scores",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: "Assignments",
      description: "View given assignments",
      icon: <Award className="w-6 h-6" />,
      path: "/assignments",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Notifications",
      description: "View notifications from mentors",
      icon: <Bell className="w-6 h-6" />,
      path: "/notifications",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <h1 className="dashboard-title">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="dashboard-subtitle">
            Track your academic progress and achievements
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="stats-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="stats-grid">
          {[
            {
              label: "Total Tests",
              value: stats.totalTests,
              icon: <FileText className="w-6 h-6" />,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              label: "Completed Exams",
              value: stats.completedExams,
              icon: <Award className="w-6 h-6" />,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50",
            },
            {
              label: "Attempted Tests",
              value: stats.attemptedTests,
              icon: <Award className="w-6 h-6" />,
              color: "from-orange-500 to-orange-600",
              bgColor: "bg-orange-50",
            },
            {
              label: "Average Score",
              value: stats.avgScore,
              icon: <BarChart3 className="w-6 h-6" />,
              color: "from-emerald-500 to-emerald-600",
              bgColor: "bg-emerald-50",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 + 0.4, duration: 0.6 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className={`stat-icon-wrapper ${stat.bgColor}`}>
                <div className={`stat-icon bg-gradient-to-r ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">
                  <CountUp end={stat.value} duration={2} />
                  {stat.label === "Average Score" ? "%" : ""}
                </h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="dashboard-main">
        {/* Left Column - Quick Actions */}
        <motion.div
          className="quick-actions-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="actions-grid">
            {studentActions.map((action, index) => (
              <motion.div
                key={index}
                className={`action-card ${action.bgColor} ${action.borderColor}`}
                onClick={() => navigate(action.path)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`action-icon-container bg-gradient-to-r ${action.color}`}>
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column - Profile Section */}
        <motion.div
          className="profile-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="section-header">
            <h2 className="section-title">Profile Information</h2>
          </div>

          <div className="profile-card">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="avatar-section">
                <div className="avatar-container">
                  <img
                    src={preview || getAvatarUrl(user?.avatar) || "/default-avatar.png"}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  {editing && (
                    <label className="avatar-upload-btn" title="Change avatar">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="profile-info">
                <h3 className="profile-name">{user?.name || "Student"}</h3>
                <div className="profile-badge">
                  <User className="w-4 h-4" />
                  <span>Student</span>
                </div>
              </div>

              {!editing && (
                <button className="edit-profile-btn" onClick={() => setEditing(true)}>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Profile Content */}
            <div className="profile-content">
              {!editing ? (
                <div className="profile-details">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{user?.email || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Education Level</span>
                      <span className="detail-value">{user?.student?.educationLevel || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Institution</span>
                      <span className="detail-value">{user?.student?.institutionName || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Contact</span>
                      <span className="detail-value">{user?.student?.contactNumber || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-edit-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      name="name"
                      value={form.name || ""}
                      onChange={onChange}
                      placeholder="Enter your full name"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Education Level</label>
                    <input
                      name="student.educationLevel"
                      value={form.student?.educationLevel || ""}
                      onChange={onChange}
                      placeholder="e.g., Bachelor's, Master's, PhD"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input
                      name="student.institutionName"
                      value={form.student?.institutionName || ""}
                      onChange={onChange}
                      placeholder="Your school or university"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input
                      name="student.contactNumber"
                      value={form.student?.contactNumber || ""}
                      onChange={onChange}
                      placeholder="Your phone number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={updateProfile}>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                    <button className="btn-cancel" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
