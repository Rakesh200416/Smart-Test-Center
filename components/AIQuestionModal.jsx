import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { generateAIQuestion } from '../services/aiService';

export default function AIQuestionModal({ isOpen, onClose, testType, onAddQuestion }) {
  const [aiQuestion, setAiQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && testType) {
      generateQuestion();
    }
  }, [isOpen, testType]);

  const generateQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const question = await generateAIQuestion(testType);
      setAiQuestion({
        ...question,
        type: testType.toLowerCase()
      });
    } catch (err) {
      setError('Failed to generate AI question. Please try again.');
      console.error('AI generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (aiQuestion) {
      onAddQuestion(aiQuestion);
      onClose();
    }
  };

  const handleRegenerateQuestion = () => {
    generateQuestion();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Generated Question</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Generating question...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={generateQuestion}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {aiQuestion && !loading && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900">{aiQuestion.question}</p>
                </div>
              </div>

              {testType === 'MCQ' && aiQuestion.options && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {aiQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                        <span className={`text-sm font-medium ${
                          String.fromCharCode(65 + index) === aiQuestion.correctOption 
                            ? 'text-green-600' 
                            : 'text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className={`${
                          String.fromCharCode(65 + index) === aiQuestion.correctOption 
                            ? 'text-green-600 font-medium' 
                            : 'text-gray-900'
                        }`}>
                          {option}
                        </span>
                        {String.fromCharCode(65 + index) === aiQuestion.correctOption && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testType === 'Coding' && (
                <div className="space-y-4">
                  {aiQuestion.sampleInput && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sample Input</label>
                      <div className="p-3 bg-gray-50 rounded-lg border font-mono text-sm">
                        {aiQuestion.sampleInput}
                      </div>
                    </div>
                  )}
                  {aiQuestion.sampleOutput && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sample Output</label>
                      <div className="p-3 bg-gray-50 rounded-lg border font-mono text-sm">
                        {aiQuestion.sampleOutput}
                      </div>
                    </div>
                  )}
                  {aiQuestion.expectedOutput && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                      <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                        {aiQuestion.expectedOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-900 font-medium">{aiQuestion.marks}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {aiQuestion && !loading && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleRegenerateQuestion}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Regenerate</span>
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}