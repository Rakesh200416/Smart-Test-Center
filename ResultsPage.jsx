import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  ArrowLeft,
  Search,
  Trophy,
  Eye,
  Calendar,
  User,
  Target,
  Bell,
  FileText,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import "../dashboard.css";

export default function ResultsPage() {
  const [studentResults, setStudentResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [testSearchTerm, setTestSearchTerm] = useState("");
  const [loadingResults, setLoadingResults] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showOlderItems, setShowOlderItems] = useState(false);
  const navigate = useNavigate();

  // Fetch student results
  useEffect(() => {
    const fetchStudentResults = async () => {
      setLoadingResults(true);
      try {
        const response = await api.get("/submissions/mentor");

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setStudentResults(response.data);
          setFilteredResults(response.data);
        } else {
          const fallbackResponse = await api.get("/submissions/all-for-mentor");
          if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
            setStudentResults(fallbackResponse.data);
            setFilteredResults(fallbackResponse.data);
          } else {
            setStudentResults([]);
            setFilteredResults([]);
          }
        }
      } catch (err) {
        setStudentResults([]);
        setFilteredResults([]);
      } finally {
        setLoadingResults(false);
      }
    };
    fetchStudentResults();
  }, []);

  // Filter results
  useEffect(() => {
    let results = [...studentResults];

    if (searchTerm) {
      results = results.filter(result => {
        const studentName =
          result.student?.name ||
          result.userId?.name ||
          result.studentName ||
          "Unknown Student";
        const testName =
          result.test?.name ||
          result.testId?.name ||
          result.testName ||
          "Unknown Test";
        return (
          studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (studentSearchTerm) {
      results = results.filter(result => {
        const studentName =
          result.student?.name ||
          result.userId?.name ||
          result.studentName ||
          "Unknown Student";
        return studentName.toLowerCase().includes(studentSearchTerm.toLowerCase());
      });
    }

    if (testSearchTerm) {
      results = results.filter(result => {
        const testName =
          result.test?.name ||
          result.testId?.name ||
          result.testName ||
          "Unknown Test";
        return testName.toLowerCase().includes(testSearchTerm.toLowerCase());
      });
    }

    setFilteredResults(results);
  }, [studentResults, searchTerm, studentSearchTerm, testSearchTerm]);

  // Fetch assignments + notifications
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const assignmentsRes = await api.get("/student/assignments");
        setAssignments(assignmentsRes.data || []);

        const notificationsRes = await api.get("/student/notifications");
        setNotifications(notificationsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch student data:", err);
      }
    };
    fetchStudentData();
  }, []);

  const getColor = (percent) => {
    if (percent < 35) return "#ef4444";
    if (percent <= 80) return "#f59e0b";
    return "#10b981";
  };

  const getGrade = (percent) => {
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B+";
    if (percent >= 60) return "B";
    if (percent >= 50) return "C";
    if (percent >= 35) return "D";
    return "F";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <button
            onClick={() => navigate("/dashboard-mentor")}
            className="flex items-center text-white mb-4 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="dashboard-title">Student Results</h1>
          <p className="dashboard-subtitle">View and analyze student performance</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="dashboard-section mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="section-title">All Results</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student or test name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              />
            </div>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by test name..."
                value={testSearchTerm}
                onChange={(e) => setTestSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="dashboard-section">
        {loadingResults ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              {searchTerm || studentSearchTerm || testSearchTerm
                ? "No results match your search criteria."
                : "No student results available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result, index) => {
              const obtained = result.obtainedMarks || 0;
              const total =
                result.totalMarks ||
                result.test?.totalMarks ||
                result.testId?.totalMarks ||
                100;
              const percent = total > 0 ? (obtained / total) * 100 : 0;
              const grade = getGrade(percent);
              const studentName =
                result.student?.name ||
                result.userId?.name ||
                result.studentName ||
                "Unknown Student";
              const testName =
                result.test?.name ||
                result.testId?.name ||
                result.testName ||
                "Unknown Test";
              const submittedAt = result.submittedAt || new Date();
              const submissionReason = result.submissionReason || "Test completed";
              const violationReason = result.violationReason || "";

              return (
                <motion.div
                  key={result._id || index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
                  style={{ borderTop: `4px solid ${getColor(percent)}` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate" title={studentName}>
                        {studentName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate" title={testName}>
                        {testName}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                      style={{ backgroundColor: getColor(percent) }}
                    >
                      {grade}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-semibold" style={{ color: getColor(percent) }}>
                        {obtained}/{total} ({percent.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="text-gray-700 font-medium">{formatDate(submittedAt)}</span>
                    </div>

                    {submissionReason && submissionReason !== "Test completed" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reason:</span>
                        <span className="text-gray-700 font-medium truncate" title={submissionReason}>
                          {submissionReason}
                        </span>
                      </div>
                    )}

                    {violationReason && (
                      <div className="flex items-center text-sm text-red-600">
                        <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate" title={violationReason}>
                          Violation detected
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: getColor(percent) }}
                    ></div>
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                    onClick={() =>
                      setSelectedResult({
                        ...result,
                        percent,
                        grade,
                        studentName,
                        testName,
                        obtained,
                        total,
                        submittedAt,
                        submissionReason,
                        violationReason
                      })
                    }
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Test Result Details</h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Student and Test Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{selectedResult.studentName}</h3>
                    <p className="text-sm text-gray-600">Student</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedResult.testName}</h4>
                  <p className="text-sm text-gray-600">Test Name</p>
                </div>
              </div>

              {/* Score Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-1">Score</p>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedResult.obtained}/{selectedResult.total}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-1">Percentage</p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: getColor(selectedResult.percent) }}
                  >
                    {selectedResult.percent?.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-1">Grade</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: getColor(selectedResult.percent) }}
                  >
                    {selectedResult.grade}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="relative mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{
                        width: `${selectedResult.percent}%`,
                        backgroundColor: getColor(selectedResult.percent)
                      }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">
                      {selectedResult.percent?.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mt-3">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Submission Info */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Submission Information</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Reason for Submission</p>
                    <p className="font-medium text-gray-900">
                      {selectedResult.submissionReason || "Test completed"}
                    </p>
                  </div>

                  {selectedResult.violationReason && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="text-sm text-red-600 mb-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Violation Detected
                      </p>
                      <p className="font-medium text-red-800">{selectedResult.violationReason}</p>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Submitted At
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedResult.submittedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Activities */}
      <div className="dashboard-section mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Student Activities</h2>
          <button
            onClick={() => setShowOlderItems(!showOlderItems)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showOlderItems ? "Hide Older Items" : "Show Older Items"}
          </button>
        </div>

        {showOlderItems && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-bold text-gray-900">Recent Assignments</h3>
              </div>

              {assignments.length === 0 ? (
                <p className="text-gray-500 text-sm">No assignments found</p>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 5).map((assignment, index) => (
                    <div key={assignment._id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-medium text-gray-900">
                        {assignment.title || "Untitled Assignment"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {assignment.description?.substring(0, 60) || "No description"}...
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{formatDate(assignment.createdAt)}</span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Assignment
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-bold text-gray-900">Recent Notifications</h3>
              </div>

              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications found</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <div key={notification._id || index} className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="font-medium text-gray-900">
                        {notification.title || "Untitled Notification"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {notification.message?.substring(0, 60) || "No message"}...
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Notification
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
