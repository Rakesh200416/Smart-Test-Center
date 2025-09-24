import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  FileText,
  Upload,
  Calendar,
  Users,
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./assignments.css";

export default function MentorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    students: []
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, studentsRes] = await Promise.all([
        api.get("/assignments/mentor"),
        api.get("/admin/users?role=student")
      ]);
      
      setAssignments(assignmentsRes.data);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please select a PDF file");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", newAssignment.title);
      formData.append("description", newAssignment.description);
      formData.append("dueDate", newAssignment.dueDate);
      formData.append("students", JSON.stringify(newAssignment.students));
      formData.append("pdfFile", pdfFile);

      await api.post("/assignments", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Close modal and reset form
      setShowCreateModal(false);
      setNewAssignment({ title: "", description: "", dueDate: "", students: [] });
      setPdfFile(null);
      fetchData();
      alert("Assignment created successfully!");
    } catch (err) {
      console.error("Error creating assignment:", err);
      alert("Failed to create assignment: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await api.delete(`/assignments/${assignmentId}`);
      fetchData();
      alert("Assignment deleted successfully!");
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert("Failed to delete assignment");
    }
  };

  const handleStudentToggle = (studentId) => {
    setNewAssignment(prev => ({
      ...prev,
      students: prev.students.includes(studentId)
        ? prev.students.filter(id => id !== studentId)
        : [...prev.students, studentId]
    }));
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewAssignment({ title: "", description: "", dueDate: "", students: [] });
    setPdfFile(null);
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
                Assignment Management
              </h1>
              <p className="text-gray-600 text-lg">Create and manage assignments for your students</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="professional-btn professional-btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Assignment
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{assignments.length}</h3>
                <p className="text-gray-600 font-medium">Total Assignments</p>
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
                <h3 className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => new Date(a.dueDate) > new Date()).length}
                </h3>
                <p className="text-gray-600 font-medium">Active</p>
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
              <div className="professional-icon-container bg-red-500">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => new Date(a.dueDate) < new Date()).length}
                </h3>
                <p className="text-gray-600 font-medium">Overdue</p>
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
              <div className="professional-icon-container bg-purple-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{students.length}</h3>
                <p className="text-gray-600 font-medium">Total Students</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Assignments List */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="professional-card-large"
        >
          <div className="professional-header">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Your Assignments
            </h2>
            <p className="text-blue-100 mt-1">Manage and track all your created assignments</p>
          </div>
          
          {assignments.length === 0 ? (
            <div className="text-center py-16">
              <div className="professional-empty-icon">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No assignments yet</h3>
              <p className="text-gray-500 mb-6">Create your first assignment to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="professional-btn professional-btn-primary"
              >
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {assignments.map((assignment, index) => {
                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                return (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className={`p-4 text-white ${
                      isOverdue
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : isDueSoon
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg truncate mr-2">
                          {assignment.title}
                        </h3>
                        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {isOverdue
                            ? `⚠️ ${Math.abs(daysUntilDue)}d overdue`
                            : daysUntilDue === 0
                            ? "📅 Due today"
                            : `⏱️ ${daysUntilDue}d left`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                        {assignment.description}
                      </p>
                      
                      {/* Assignment Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="w-3 h-3 mr-2 text-indigo-500" />
                          <span>Created: {formatDate(assignment.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-3 h-3 mr-2 text-purple-500" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="w-3 h-3 mr-2 text-green-500" />
                          <span>{assignment.students?.length || 0} students assigned</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <button
                          onClick={() => window.open(`http://localhost:5002${assignment.pdfFile}`, '_blank')}
                          className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          View PDF
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Create Assignment Modal */}
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
                      <Plus className="w-6 h-6 mr-3" />
                      Create New Assignment
                    </h2>
                    <p className="text-blue-100 mt-1">Share knowledge and assignments with your students</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="professional-close-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateAssignment} className="professional-modal-content">
                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                      className="professional-form-input"
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Description *
                    </label>
                    <textarea
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="professional-form-textarea"
                      placeholder="Enter assignment description"
                      required
                    />
                  </div>

                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="professional-form-input"
                      required
                    />
                  </div>

                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      PDF File *
                    </label>
                    <div className="professional-file-upload">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        className="professional-file-input"
                        required
                      />
                      <div className="professional-file-upload-content">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {pdfFile ? pdfFile.name : "Click to upload PDF file (max 10MB)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="professional-form-group">
                    <label className="professional-form-label">
                      Assign to Students (optional)
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
                                checked={newAssignment.students.includes(student._id)}
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
                      Leave empty to assign to all students
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
                      {submitting ? "Creating..." : "Create Assignment"}
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