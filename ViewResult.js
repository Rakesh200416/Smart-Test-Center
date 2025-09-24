import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  User,
  Search,
  Filter,
  BarChart3,
  Award,
  Calendar,
  ArrowLeft,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Clock,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function ViewResult() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [tests, setTests] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, selectedTest]);

  const fetchData = async () => {
    try {
      // Fetch submissions from mentor's tests
      const submissionsRes = await api.get("/submissions/mentor");
      setSubmissions(submissionsRes.data);
      
      // Extract unique tests
      const uniqueTests = submissionsRes.data.reduce((acc, submission) => {
        if (!acc.find(test => test._id === submission.test._id)) {
          acc.push({
            _id: submission.test._id,
            name: submission.test.name
          });
        }
        return acc;
      }, []);
      setTests(uniqueTests);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;
    
    if (searchTerm) {
      filtered = filtered.filter(submission => 
        submission.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.student?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTest) {
      filtered = filtered.filter(submission => submission.test._id === selectedTest);
    }
    
    setFilteredSubmissions(filtered);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 80) return <TrendingUp className="w-4 h-4" />;
    if (percentage >= 60) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
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

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "F";
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  const exportResults = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Email,Test Name,Score,Percentage,Grade,Submitted At\n"
      + filteredSubmissions.map(submission => {
          const percentage = ((submission.score.obtainedMarks / submission.score.totalMarks) * 100).toFixed(1);
          return `${submission.student?.name},${submission.student?.email},${submission.test.name},${submission.score.obtainedMarks}/${submission.score.totalMarks},${percentage}%,${getGrade(percentage)},${formatDate(submission.submittedAt)}`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 group transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                Student Results
              </h1>
              <p className="text-gray-600 text-lg">View and analyze student test performance</p>
            </div>
            <button
              onClick={exportResults}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Download className="w-6 h-6 mr-3" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                />
              </div>
            </div>
            <div className="md:w-80">
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
              >
                <option value="">📋 All Tests</option>
                {tests.map(test => (
                  <option key={test._id} value={test._id}>{test.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-8 border border-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-xl shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="ml-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{filteredSubmissions.length}</h3>
                <p className="text-gray-600 font-medium">Total Submissions</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-8 border border-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="ml-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {filteredSubmissions.length > 0 
                    ? (filteredSubmissions.reduce((sum, sub) => sum + (sub.score.obtainedMarks / sub.score.totalMarks * 100), 0) / filteredSubmissions.length).toFixed(1)
                    : 0}%
                </h3>
                <p className="text-gray-600 font-medium">Average Score</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-8 border border-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-4 rounded-xl shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="ml-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {filteredSubmissions.filter(sub => (sub.score.obtainedMarks / sub.score.totalMarks * 100) >= 80).length}
                </h3>
                <p className="text-gray-600 font-medium">High Performers (≥ 80%)</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-8 border border-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-xl shadow-lg">
                <TrendingDown className="w-7 h-7 text-white" />
              </div>
              <div className="ml-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {filteredSubmissions.filter(sub => (sub.score.obtainedMarks / sub.score.totalMarks * 100) < 60).length}
                </h3>
                <p className="text-gray-600 font-medium">Need Attention (&lt; 60%)</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Results Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-8">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BarChart3 className="w-7 h-7 mr-3" />
              Student Results ({filteredSubmissions.length})
            </h2>
            <p className="text-blue-100 mt-2">Comprehensive overview of student performance</p>
          </div>
          
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">No results found</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedTest 
                  ? "Try adjusting your search filters"
                  : "No student submissions available yet"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
              {filteredSubmissions.map((submission, index) => {
                const percentage = ((submission.score.obtainedMarks / submission.score.totalMarks) * 100).toFixed(1);
                const grade = getGrade(percentage);
                
                return (
                  <motion.div
                    key={submission._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
                    onClick={() => handleViewDetails(submission)}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {submission.student?.name}
                        </h3>
                        <p className="text-gray-600 mb-3 font-medium">
                          {submission.student?.email}
                        </p>
                        <p className="text-gray-700 font-semibold bg-gray-100 px-3 py-2 rounded-lg inline-block">
                          {submission.test.name}
                        </p>
                      </div>
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full ${getScoreColor(percentage)} bg-gradient-to-r from-blue-50 to-green-50 group-hover:scale-110 transition-transform`}>
                        <span className="text-2xl font-bold">{grade}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Score:</span>
                        <span className="font-bold text-lg text-gray-900">
                          {submission.score.obtainedMarks}/{submission.score.totalMarks}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Percentage:</span>
                        <span className={`font-bold text-xl ${getScoreColor(percentage)}`}>
                          {percentage}%
                        </span>
                      </div>
                      
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              percentage >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                              percentage >= 60 ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-gradient-to-r from-red-500 to-pink-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white drop-shadow-sm">{percentage}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">
                          📅 {formatDate(submission.submittedAt)}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Detail Modal */}
        {showDetailModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Submission Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Student</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{selectedSubmission.student?.name}</p>
                    <p className="text-gray-600 font-medium">{selectedSubmission.student?.email}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Test</h3>
                    <p className="text-2xl font-bold text-gray-900">{selectedSubmission.test.name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Score</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedSubmission.score.obtainedMarks}/{selectedSubmission.score.totalMarks}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Percentage</h3>
                    <p className={`text-3xl font-bold ${
                      getScoreColor((selectedSubmission.score.obtainedMarks / selectedSubmission.score.totalMarks * 100).toFixed(1))
                    }`}>
                      {((selectedSubmission.score.obtainedMarks / selectedSubmission.score.totalMarks) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Grade</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {getGrade((selectedSubmission.score.obtainedMarks / selectedSubmission.score.totalMarks * 100).toFixed(1))}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wide">Submission Details</h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="font-semibold text-gray-700 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                        Submitted At:
                      </span>
                      <span className="font-bold text-gray-900">{formatDate(selectedSubmission.submittedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="font-semibold text-gray-700 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-green-500" />
                        Time Taken:
                      </span>
                      <span className="font-bold text-gray-900">
                        {selectedSubmission.timeTaken ? `${Math.round(selectedSubmission.timeTaken / 60)} minutes` : "N/A"}
                      </span>
                    </div>
                    {selectedSubmission.submissionReason && (
                      <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                        <span className="font-semibold text-gray-700">Reason:</span>
                        <span className="font-bold text-gray-900">{selectedSubmission.submissionReason}</span>
                      </div>
                    )}
                    {selectedSubmission.violationReason && (
                      <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
                        <span className="font-semibold text-red-700 flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          Violation:
                        </span>
                        <span className="font-bold text-red-900">{selectedSubmission.violationReason}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end pt-6 border-t-2 border-gray-100">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
