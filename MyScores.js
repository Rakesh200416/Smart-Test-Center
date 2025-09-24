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
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="header-section">
          <h1>My Test Scores</h1>
          <p>Track your performance across all tests</p>
        </div>

        {/* Stats Cards */}
        {totalTests > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-icon trophy">
                  <Trophy size={24} />
                </div>
                <div className="stat-info">
                  <h3>Total Tests</h3>
                  <p>{totalTests}</p>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-icon target">
                  <Target size={24} />
                </div>
                <div className="stat-info">
                  <h3>Average Score</h3>
                  <p>{averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-icon book">
                  <BookOpen size={24} />
                </div>
                <div className="stat-info">
                  <h3>Grade</h3>
                  <p>{getGrade(averageScore)}</p>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card-content">
                <div className="stat-icon calendar">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <h3>Categories</h3>
                  <p>{Object.keys(groupedScores).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Scores Message */}
        {totalTests === 0 ? (
          <div className="no-scores">
            <Trophy className="no-scores-icon" size={80} />
            <h3>No scores available yet</h3>
            <p className="text-gray-600">Take your first test to see results here!</p>
          </div>
        ) : (
          /* Scores by Category */
          <div className="category-sections">
            {Object.entries(groupedScores).map(([category, categoryScores]) => (
              <div key={category} className="category-section">
                <div className="category-header">
                  <h2>
                    {category} Tests ({categoryScores.length})
                  </h2>
                </div>
                
                <div className="scores-grid">
                  {categoryScores.map((score) => {
                    const obtained = score.obtainedMarks || 0;
                    const total = score.totalMarks || 0;
                    const percent = total > 0 ? (obtained / total) * 100 : 0;
                    const grade = getGrade(percent);
                    
                    return (
                      <div
                        key={score._id}
                        className="score-card"
                        onClick={() => setSelectedScore({ ...score, percent, grade })}
                      >
                        <div className="score-card-header">
                          <h3 className="test-name">
                            {score.testName || "Unnamed Test"}
                          </h3>
                          <span
                            className="grade-badge"
                            style={{ backgroundColor: getColor(percent) }}
                          >
                            {grade}
                          </span>
                        </div>
                        
                        <div className="score-details">
                          <div className="score-row">
                            <span className="score-label">Score:</span>
                            <span className="score-value" style={{ color: getColor(percent) }}>
                              {obtained}/{total} ({percent.toFixed(1)}%)
                            </span>
                          </div>
                          
                          <div className="score-row">
                            <span className="score-label">Date:</span>
                            <span className="date-value">{formatDate(score.submittedAt)}</span>
                          </div>
                        </div>
                        
                        <button
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScore({ ...score, percent, grade });
                          }}
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
          <div className="modal-overlay" onClick={() => setSelectedScore(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Test Details</h2>
                <button
                  className="close-btn"
                  onClick={() => setSelectedScore(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="test-info">
                  <h3>
                    {selectedScore.testName || "Unnamed Test"}
                  </h3>
                  <p className="test-category">
                    Category: {selectedScore.category || "Unknown"}
                  </p>
                </div>
                
                <div className="score-summary">
                  <div className="score-summary-row">
                    <span className="score-summary-label">Score:</span>
                    <span
                      className="score-summary-value"
                      style={{ color: getColor(selectedScore.percent) }}
                    >
                      {selectedScore.obtainedMarks || 0}/{selectedScore.totalMarks || 0}
                    </span>
                  </div>
                  
                  <div className="score-summary-row">
                    <span className="score-summary-label">Percentage:</span>
                    <span
                      className="score-summary-value"
                      style={{ color: getColor(selectedScore.percent) }}
                    >
                      {selectedScore.percent.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="score-summary-row">
                    <span className="score-summary-label">Grade:</span>
                    <span
                      className="score-summary-value final-grade"
                      style={{ backgroundColor: getColor(selectedScore.percent) }}
                    >
                      {selectedScore.grade}
                    </span>
                  </div>
                </div>
                
                <div className="submission-date">
                  <p>
                    <strong>Submitted:</strong> {formatDate(selectedScore.submittedAt)}
                  </p>
                </div>
                
                <div className="performance-analysis">
                  <h4 className="analysis-title">Performance Analysis</h4>
                  <p className="analysis-text">
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