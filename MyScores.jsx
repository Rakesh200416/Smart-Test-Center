import { useEffect, useState } from "react";
import { Trophy, Calendar, Target, BookOpen } from "lucide-react";
import api from "../utils/api";
import "./myscores.css";

export default function MyScores() {
  const [scores, setScores] = useState([]);
  const [selectedScore, setSelectedScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        // Try multiple endpoints to get scores
        let data = [];
        
        // Try submissions endpoint
        try {
          const submissionsRes = await api.get("/submissions/my");
          if (submissionsRes.data && Array.isArray(submissionsRes.data)) {
            data = submissionsRes.data.map(submission => ({
              _id: submission._id,
              testName: submission.testId?.name || "Unknown Test",
              category: submission.category || "Unknown",
              obtainedMarks: submission.obtainedMarks || 0,
              totalMarks: submission.testId?.totalMarks || 0,
              submittedAt: submission.submittedAt,
              testId: submission.testId?._id
            }));
          }
        } catch (err) {
          console.log("Submissions endpoint failed, trying student scores...");
        }
        
        // If no data from submissions, try student scores endpoint
        if (data.length === 0) {
          try {
            const scoresRes = await api.get("/student/scores");
            if (scoresRes.data?.scores) {
              data = scoresRes.data.scores;
            }
          } catch (err) {
            console.log("Student scores endpoint also failed");
          }
        }
        
        setScores(data);
      } catch (err) {
        console.error("Error fetching scores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const getColor = (percent) => {
    if (percent < 35) return "#ef4444"; // red-500
    if (percent <= 80) return "#f59e0b"; // amber-500
    return "#10b981"; // emerald-500
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
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  // Group scores by category
  const groupedScores = scores.reduce((acc, score) => {
    const category = (score.category || "unknown").toLowerCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(score);
    return acc;
  }, {});

  // Calculate overall stats
  const totalTests = scores.length;
  const averageScore = totalTests > 0 
    ? scores.reduce((sum, score) => {
        const total = score.totalMarks || 0;
        const obtained = score.obtainedMarks || 0;
        return sum + (total > 0 ? (obtained / total) * 100 : 0);
      }, 0) / totalTests 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Test Scores</h1>
          <p className="text-gray-600">Track your performance across all tests</p>
        </div>

        {/* Stats Cards */}
        {totalTests > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Grade</p>
                  <p className="text-2xl font-bold text-gray-900">{getGrade(averageScore)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedScores).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Scores Message */}
        {totalTests === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No scores available yet</h3>
            <p className="text-gray-600">Take your first test to see results here!</p>
          </div>
        ) : (
          /* Scores by Category */
          <div className="space-y-8">
            {Object.entries(groupedScores).map(([category, categoryScores]) => (
              <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {category} Tests ({categoryScores.length})
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {categoryScores.map((score) => {
                    const obtained = score.obtainedMarks || 0;
                    const total = score.totalMarks || 0;
                    const percent = total > 0 ? (obtained / total) * 100 : 0;
                    const grade = getGrade(percent);
                    
                    return (
                      <div
                        key={score._id}
                        className="border-2 border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        style={{ borderTopColor: getColor(percent), borderTopWidth: '4px' }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {score.testName || "Unnamed Test"}
                          </h3>
                          <span 
                            className="px-2 py-1 rounded text-sm font-bold text-white"
                            style={{ backgroundColor: getColor(percent) }}
                          >
                            {grade}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Score:</span>
                            <span className="font-semibold" style={{ color: getColor(percent) }}>
                              {obtained}/{total} ({percent.toFixed(1)}%)
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Date:</span>
                            <span className="text-gray-700">{formatDate(score.submittedAt)}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedScore({ ...score, percent, grade })}
                          className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedScore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Test Details</h2>
                <button
                  onClick={() => setSelectedScore(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {selectedScore.testName || "Unnamed Test"}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    Category: {selectedScore.category || "Unknown"}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Score:</span>
                    <span 
                      className="font-bold text-lg"
                      style={{ color: getColor(selectedScore.percent) }}
                    >
                      {selectedScore.obtainedMarks || 0}/{selectedScore.totalMarks || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Percentage:</span>
                    <span 
                      className="font-bold"
                      style={{ color: getColor(selectedScore.percent) }}
                    >
                      {selectedScore.percent.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Grade:</span>
                    <span 
                      className="font-bold text-lg px-3 py-1 rounded text-white"
                      style={{ backgroundColor: getColor(selectedScore.percent) }}
                    >
                      {selectedScore.grade}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Submitted:</strong> {formatDate(selectedScore.submittedAt)}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Performance Analysis</h4>
                  <p className="text-sm text-gray-700">
                    {selectedScore.percent < 35
                      ? "Your performance needs significant improvement. Focus on understanding basic concepts and practice regularly with similar questions."
                      : selectedScore.percent <= 60
                      ? "Good effort! You understand the basics but need to work on accuracy and speed. Review incorrect answers and practice more."
                      : selectedScore.percent <= 80
                      ? "Great work! You have a solid understanding. Focus on mastering advanced concepts and optimizing your approach."
                      : "Excellent performance! You demonstrate strong mastery of the subject. Keep up the outstanding work and help others learn."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}