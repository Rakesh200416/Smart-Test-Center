import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./notifications.css";
import {
  Bell,
  Send,
  Users,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Info,
  MessageCircle,
  Heart,
  ThumbsUp,
  Lightbulb,
  Frown,
  Clock,
  CheckCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MentorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "medium",
    recipients: [],
    expiresAt: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    totalReactions: 0,
    readRate: 0,
    reactionRate: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notificationsRes, studentsRes, statsRes] = await Promise.all([
        api.get("/notifications/mentor"),
        api.get("/admin/users?role=student"),
        api.get("/notifications/stats")
      ]);
      
      setNotifications(notificationsRes.data);
      setStudents(studentsRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post("/notifications", {
        ...newNotification,
        expiresAt: newNotification.expiresAt || null
      });

      // Close modal and reset form
      setShowCreateModal(false);
      setNewNotification({
        title: "",
        message: "",
        type: "general",
        priority: "medium",
        recipients: [],
        expiresAt: ""
      });
      fetchData();
      alert("Notification sent successfully!");
    } catch (err) {
      console.error("Error creating notification:", err);
      alert("Failed to send notification: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await api.delete(`/notifications/${notificationId}`);
      fetchData();
      alert("Notification deleted successfully!");
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification");
    }
  };

  const handleStudentToggle = (studentId) => {
    setNewNotification(prev => ({
      ...prev,
      recipients: prev.recipients.includes(studentId)
        ? prev.recipients.filter(id => id !== studentId)
        : [...prev.recipients, studentId]
    }));
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewNotification({
      title: "",
      message: "",
      type: "general",
      priority: "medium",
      recipients: [],
      expiresAt: ""
    });
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

  const getReactionIcon = (reaction) => {
    switch (reaction) {
      case "like": return <ThumbsUp className="w-4 h-4" />;
      case "love": return <Heart className="w-4 h-4" />;
      case "helpful": return <Lightbulb className="w-4 h-4" />;
      case "confused": return <Frown className="w-4 h-4" />;
      default: return null;
    }
  };

  const getReactionCounts = (notification) => {
    const counts = { like: 0, love: 0, helpful: 0, confused: 0 };
    notification.recipients?.forEach(recipient => {
      if (recipient.reaction) {
        counts[recipient.reaction]++;
      }
    });
    return counts;
  };

  const getReadCount = (notification) => {
    return notification.recipients?.filter(r => r.readAt).length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 group transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Notification Management
              </h1>
              <p className="text-gray-600 text-lg">Send and manage notifications for your students</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="professional-btn professional-btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Notification
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="professional-card"
          >
            <div className="flex items-center">
              <div className="professional-icon-container bg-blue-500">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</h3>
                <p className="text-gray-600 font-medium">Total Sent</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="professional-card"
          >
            <div className="flex items-center">
              <div className="professional-icon-container bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.readRate}%</h3>
                <p className="text-gray-600 font-medium">Read Rate</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="professional-card"
          >
            <div className="flex items-center">
              <div className="professional-icon-container bg-purple-500">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalReactions}</h3>
                <p className="text-gray-600 font-medium">Total Reactions</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="professional-card"
          >
            <div className="flex items-center">
              <div className="professional-icon-container bg-orange-500">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.reactionRate}%</h3>
                <p className="text-gray-600 font-medium">Reaction Rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Notifications List */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="professional-card-large"
        >
          <div className="professional-header">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Bell className="w-6 h-6 mr-3" />
              Your Notifications
            </h2>
            <p className="text-blue-100 mt-1">Track engagement and manage all sent notifications</p>
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="professional-empty-icon">
                <Bell className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h3>
              <p className="text-gray-500 mb-6">Send your first notification to students</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="professional-btn professional-btn-primary"
              >
                Send Notification
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {notifications.map((notification, index) => {
                const reactionCounts = getReactionCounts(notification);
                const readCount = getReadCount(notification);
                const totalRecipients = notification.recipients?.length || 0;

                const getTypeGradient = (type) => {
                  switch(type) {
                    case 'general':
                      return 'bg-gradient-to-r from-blue-500 to-blue-600';
                    case 'assignment':
                      return 'bg-gradient-to-r from-green-500 to-green-600';
                    case 'test':
                      return 'bg-gradient-to-r from-purple-500 to-purple-600';
                    case 'announcement':
                      return 'bg-gradient-to-r from-orange-500 to-orange-600';
                    default:
                      return 'bg-gradient-to-r from-gray-500 to-gray-600';
                  }
                };

                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className={`p-4 text-white ${getTypeGradient(notification.type)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg truncate">{notification.title}</h3>
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                          {notification.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20`}>
                          {notification.priority} priority
                        </div>
                        <div className="text-xs opacity-90">
                          {formatDate(notification.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1">
                      <p className="text-gray-700 mb-4 line-clamp-3">{notification.message}</p>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4 text-green-500" />
                          <span>{totalRecipients} recipients</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                          <span>{readCount} read</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{Object.values(reactionCounts).reduce((a, b) => a + b, 0)} reactions</span>
                        </div>
                        {notification.expiresAt && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-xs">Expires {formatDate(notification.expiresAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Reactions Bar */}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {Object.entries(reactionCounts).map(([reaction, count]) => (
                              count > 0 && (
                                <div key={reaction} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                                  <div className="text-blue-600">{getReactionIcon(reaction)}</div>
                                  <span className="font-semibold">{count}</span>
                                </div>
                              )
                            ))}
                            {Object.values(reactionCounts).every(count => count === 0) && (
                              <span className="text-gray-400 italic text-xs">No reactions</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Read: {Math.round((readCount / totalRecipients) * 100) || 0}%
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Create Notification Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="professional-modal-overlay"
              onClick={closeModal}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="professional-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="professional-modal-header">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Send className="w-6 h-6 mr-3" />
                      Send New Notification
                    </h2>
                    <p className="text-blue-100 mt-1">Communicate effectively with your students</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="professional-close-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateNotification} className="professional-modal-content">
                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                      className="professional-form-input"
                      placeholder="Enter notification title"
                      required
                    />
                  </div>

                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Message *
                    </label>
                    <textarea
                      value={newNotification.message}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="professional-form-textarea"
                      placeholder="Enter notification message"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="professional-form-group">
                      <label className="professional-form-label">
                        Type
                      </label>
                      <select
                        value={newNotification.type}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                        className="professional-form-select"
                      >
                        <option value="general">📢 General</option>
                        <option value="assignment">📝 Assignment</option>
                        <option value="test">📊 Test</option>
                        <option value="announcement">📣 Announcement</option>
                      </select>
                    </div>

                    <div className="professional-form-group">
                      <label className="professional-form-label">
                        Priority
                      </label>
                      <select
                        value={newNotification.priority}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value }))}
                        className="professional-form-select"
                      >
                        <option value="low">🟢 Low</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🟠 High</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Expires At (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newNotification.expiresAt}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="professional-form-input"
                    />
                  </div>

                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Send to Students (optional)
                    </label>
                    <div className="professional-students-list">
                      {students.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No students available</p>
                      ) : (
                        <div className="space-y-2">
                          {students.map(student => (
                            <label key={student._id} className="professional-student-item">
                              <input
                                type="checkbox"
                                checked={newNotification.recipients.includes(student._id)}
                                onChange={() => handleStudentToggle(student._id)}
                                className="professional-checkbox"
                              />
                              <span className="font-medium">{student.name}</span>
                              <span className="text-gray-500 ml-2">({student.email})</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Leave empty to send to all students
                    </p>
                  </div>

                  <div className="professional-modal-actions">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="professional-btn professional-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="professional-btn professional-btn-primary"
                    >
                      {submitting ? "Sending..." : "Send Notification"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}