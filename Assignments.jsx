import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  FileText,
  Download,
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Bell,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import "./student-assignments.css";
import "./student-notifications.css";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, notificationsRes] = await Promise.all([
        api.get("/assignments/student"),
        api.get("/notifications/student")
      ]);
      
      setAssignments(assignmentsRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (assignmentId, filename) => {
    try {
      const response = await api.get(`/assignments/download/${assignmentId}`, {
        responseType: 'blob'
      });
      
      // Create blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const addReaction = async (notificationId, reaction) => {
    try {
      await api.patch(`/notifications/${notificationId}/reaction`, { reaction });
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error adding reaction:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="student-loading">
        <div className="student-loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="student-assignments-container">
      <div className="student-assignments-header">
        {/* Header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="student-back-button"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <div className="text-center">
          <h1 className="student-page-title">
            Learning Hub
          </h1>
          <p className="student-page-subtitle">Your assignments and notifications in one place</p>
        </div>
      </div>

      <div className="student-content-container">
        {/* Tabs */}
        <div className="student-tabs-container">
          <div className="student-tabs">
            <button
              onClick={() => setActiveTab("assignments")}
              className={`student-tab-button ${
                activeTab === "assignments" ? "active" : ""
              }`}
            >
              <FileText className="w-6 h-6" />
              Assignments
              <span className="student-tab-badge">
                {assignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`student-tab-button ${
                activeTab === "notifications" ? "active" : ""
              }`}
            >
              <Bell className="w-6 h-6" />
              Notifications
              <span className="student-tab-badge">
                {notifications.filter(n => !n.isRead).length} new
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "assignments" ? (
          <div className="student-assignments-grid">
            {assignments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="student-empty-state"
              >
                <div className="student-empty-icon">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="student-empty-title">
                  No assignments yet
                </h3>
                <p className="student-empty-subtitle">
                  Assignments from your mentors will appear here
                </p>
              </motion.div>
            ) : (
              assignments.map((assignment, index) => {
                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                return (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="student-assignment-card student-fade-in"
                  >
                    <div className="student-card-content">
                      <div className="student-assignment-header">
                        <div>
                          <h3 className="student-assignment-title">
                            {assignment.title}
                          </h3>
                          <p className="student-assignment-description">
                            {assignment.description}
                          </p>
                        </div>
                        
                        <div className={`student-status-badge ${
                          isOverdue ? "student-status-overdue" : 
                          isDueSoon ? "student-status-due-soon" : 
                          "student-status-active"
                        }`}>
                          <Clock className="w-5 h-5" />
                          {isOverdue
                            ? `Overdue by ${Math.abs(daysUntilDue)} days`
                            : daysUntilDue === 0
                            ? "Due today"
                            : `${daysUntilDue} days left`
                          }
                        </div>
                      </div>
                      
                      <div className="student-assignment-meta">
                        <div className="student-meta-item">
                          <User className="student-meta-icon" />
                          <span className="student-meta-text">By: {assignment.createdBy?.name}</span>
                        </div>
                        <div className="student-meta-item">
                          <Calendar className="student-meta-icon" />
                          <span className="student-meta-text">Assigned: {formatDate(assignment.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="student-due-date-section">
                        <div className="student-due-date-container">
                          <Calendar className="student-due-date-icon" />
                          <span className="student-due-date-text">
                            Due Date: {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDownload(assignment._id, assignment.originalFilename)}
                        className="student-download-button"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          <div className="student-notifications-grid">
            {notifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="student-empty-state"
              >
                <div className="student-empty-icon">
                  <Bell className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="student-empty-title">
                  No notifications yet
                </h3>
                <p className="student-empty-subtitle">
                  Notifications from your mentors will appear here
                </p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`student-notification-card student-fade-in ${
                    !notification.isRead ? "unread" : ""
                  }`}
                >
                  <div className="student-card-content">
                    <div className="student-notification-header">
                      <div>
                        <h3 className="student-notification-title">
                          {notification.title}
                        </h3>
                        <div className="student-notification-badges">
                          {!notification.isRead && (
                            <span className="student-new-badge">
                              New
                            </span>
                          )}
                          <span className={`student-priority-badge student-priority-${notification.priority}`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="student-notification-message">
                      {notification.message}
                    </p>
                    
                    <div className="student-notification-info">
                      <div className="student-info-item">
                        <User className="student-info-icon" />
                        <span className="student-info-text">From: {notification.createdBy?.name}</span>
                      </div>
                      <div className="student-info-item">
                        <Calendar className="student-info-icon" />
                        <span className="student-info-text">{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="student-reactions-section">
                      <div className="student-reactions-title">React to this notification:</div>
                      <div className="student-reactions-buttons">
                        {["like", "love", "helpful", "confused"].map((reaction) => (
                          <button
                            key={reaction}
                            onClick={() => addReaction(notification._id, reaction)}
                            className={`student-reaction-button ${
                              notification.userReaction === reaction ? "active" : ""
                            }`}
                          >
                            {reaction === "like" && "👍"}
                            {reaction === "love" && "❤️"}
                            {reaction === "helpful" && "💡"}
                            {reaction === "confused" && "😕"}
                            <span className="capitalize">{reaction}</span>
                          </button>
                        ))}
                        
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="student-mark-read-button"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}