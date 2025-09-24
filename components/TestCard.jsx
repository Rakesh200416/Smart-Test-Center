import React from 'react';
import { Clock, BookOpen, Target, Play } from 'lucide-react';

export default function TestCard({ test, onTakeTest }) {
  const getCategoryColor = (category) => {
    const colors = {
      'mcq': 'from-blue-500 to-blue-600',
      'coding': 'from-green-500 to-green-600', 
      'long': 'from-purple-500 to-purple-600',
      'mixed': 'from-orange-500 to-orange-600',
      'default': 'from-gray-500 to-gray-600'
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'mcq': return <Target className="w-5 h-5" />;
      case 'coding': return <BookOpen className="w-5 h-5" />;
      case 'long': return <BookOpen className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get question count from multiple possible sources
  const questionCount = test.questionCount || (test.questions ? test.questions.length : 0);

  return (
    <div className="test-card">
      {/* Header */}
      <div className={`test-card-header bg-gradient-to-r ${getCategoryColor(test.category)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(test.category)}
            <span className="text-white font-medium capitalize">
              {test.category || 'Mixed'}
            </span>
          </div>
          <div className="test-card-badge">
            {test.totalMarks || 0} pts
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="test-card-body">
        <h3 className="test-card-title">{test.name || 'Untitled Test'}</h3>

        {/* Test summary line */}
        <p className="text-sm text-gray-600 mb-3 font-medium">
          {test.duration || 0} min • {test.totalMarks || 0} marks • {questionCount} questions
        </p>

        {/* Stats with icons */}
        <div className="test-card-stats">
          <div className="stat-item">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{test.duration || 0} min</span>
          </div>
          <div className="stat-item">
            <Target className="w-4 h-4 text-green-500" />
            <span>{test.totalMarks || 0} marks</span>
          </div>
          <div className="stat-item">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span>{questionCount} questions</span>
          </div>
        </div>

        <div className="test-card-meta">
          <span className="text-sm text-gray-500">
            Created: {formatDate(test.createdAt)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="test-card-footer">
        <button 
          onClick={() => onTakeTest(test)}
          className="test-card-button"
        >
          <Play className="w-4 h-4 mr-2" />
          Take Test
        </button>
      </div>
    </div>
  );
}