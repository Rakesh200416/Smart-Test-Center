import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Sparkles, Plus, Eye, Save, BookOpen, Code, FileText } from 'lucide-react';
import { generateAIQuestion } from '../services/aiService';
import AIQuestionModal from '../components/AIQuestionModal';
import "./AddTest1.css";

export default function AddTest({ onTestCreated, onBack }) {
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: 'A',
    marks: 1,
    expectedOutput: '',
  });
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const testTypeOptions = [
    { type: 'MCQ', label: 'Multiple Choice', icon: BookOpen, description: 'Single or multiple correct answers', color: 'blue' },
    { type: 'Long', label: 'Long Answer', icon: FileText, description: 'Descriptive text responses', color: 'emerald' },
    { type: 'Coding', label: 'Coding', icon: Code, description: 'Programming problems', color: 'purple' },
  ];

  const handleTestTypeSelect = (type) => {
    setTestType(type);
    setQuestions([]);
    resetCurrentQuestion(type);
  };

  const resetCurrentQuestion = (type = testType) => {
    if (type === 'MCQ') {
      setCurrentQ({
        question: '',
        options: ['', '', '', ''],
        correctOption: 'A',
        marks: 1,
        type: 'mcq'
      });
    } else if (type === 'Long') {
      setCurrentQ({
        question: '',
        options: [],
        marks: 1,
        type: 'long'
      });
    } else if (type === 'Coding') {
      setCurrentQ({
        question: '',
        options: [],
        marks: 1,
        expectedOutput: '',
        sampleInput: '',
        sampleOutput: '',
        type: 'coding'
      });
    }
  };

  const handleOptionChange = (index, value) => {
    if (currentQ.options && Array.isArray(currentQ.options)) {
      const updatedOptions = [...currentQ.options];
      updatedOptions[index] = value;
      setCurrentQ({ ...currentQ, options: updatedOptions });
    }
  };

  const validateQuestion = (questionData) => {
    if (!questionData.question?.trim()) {
      alert('Please enter the question!');
      return false;
    }

    if (testType === 'MCQ') {
      if (!questionData.options || questionData.options.length !== 4) {
        alert('MCQ questions must have exactly 4 options!');
        return false;
      }
      
      if (questionData.options.some(opt => !opt || !opt.toString().trim())) {
        alert('Please fill in all options for MCQ!');
        return false;
      }

      if (!questionData.correctOption) {
        alert('Please select the correct option!');
        return false;
      }
    }

    if (!questionData.marks || questionData.marks < 1) {
      alert('Please set valid marks (minimum 1)!');
      return false;
    }

    return true;
  };

  const handleAddQuestion = (questionData = currentQ) => {
    if (!validateQuestion(questionData)) {
      return;
    }

    const lowerType = testType.toLowerCase();

    const newQuestion = {
      type: lowerType,
      question: questionData.question.trim(),
      marks: questionData.marks || 1,
      ...(testType === 'MCQ' && {
        options: questionData.options,
        correctOption: questionData.correctOption
      }),
      ...(testType === 'Coding' && {
        expectedOutput: questionData.expectedOutput || '',
        sampleInput: questionData.sampleInput || '',
        sampleOutput: questionData.sampleOutput || ''
      })
    };

    console.log('Adding question:', newQuestion);
    setQuestions(prev => [...prev, newQuestion]);
    resetCurrentQuestion();
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      await generateAIQuestion(testType);
      setShowAIModal(true);
    } catch (error) {
      console.error('AI generation error:', error);
      alert('AI generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmitTest = async () => {
    // Validation
    if (!testName.trim()) {
      alert('Please enter a test name!');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question!');
      return;
    }

    if (questions.length !== numQuestions) {
      alert(`Please add exactly ${numQuestions} questions! Currently have ${questions.length}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const lowerType = testType.toLowerCase();

      const testData = {
        name: testName.trim(),
        category: lowerType,
        type: lowerType,
        duration: duration,
        totalMarks: totalMarks,
        questions: questions
      };

      console.log('Submitting test data:', testData);

      // Get user credentials
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const email = savedUser.email || prompt('Enter your email:');
      const password = prompt('Enter your password:');
      
      if (!email || !password) {
        alert('Email and password are required');
        return;
      }

      const response = await axios.post(
        "http://localhost:5004/api/tests/create-with-credentials",
        {
          email,
          password,
          testData
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Test creation response:', response.data);
      alert("Test created successfully!");
      
      if (onTestCreated) {
        onTestCreated(response.data);
      }

      // Reset form
      setTestName("");
      setTestType("");
      setQuestions([]);
      setNumQuestions(5);
      setDuration(30);
      resetCurrentQuestion();

    } catch (error) {
      console.error("Test creation error:", error);
      
      let errorMessage = "Failed to create test. ";
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        if (typeof serverError === 'string') {
          errorMessage += serverError;
        } else if (serverError.message) {
          errorMessage += serverError.message;
        } else if (serverError.error) {
          errorMessage += serverError.error;
        } else {
          errorMessage += `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = questions.length === numQuestions && testName.trim() && !isSubmitting;

  return (
    <div className="add-test-page min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Test</h1>
          </div>
          {canSubmit && (
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Submit Test'}</span>
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {testType && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {questions.length} / {numQuestions} questions</span>
              <span>Total Marks: {questions.reduce((sum, q) => sum + (q.marks || 0), 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questions.length / numQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Test Type Selection */}
        {!testType && (
          <div className="test-type-section">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Choose Test Type</h2>
            <div className="test-type-cards">
              {testTypeOptions.map(({ type, label, icon: Icon, description, color }) => (
                <div
                  key={type}
                  className="test-type-card group cursor-pointer"
                  onClick={() => handleTestTypeSelect(type)}
                >
                  <div
                    className="icon-wrap"
                    style={{
                      background:
                        color === 'blue'
                          ? '#dbeafe'
                          : color === 'emerald'
                          ? '#d1fae5'
                          : '#ede9fe',
                    }}
                  >
                    <Icon className={`h-8 w-8 text-${color}-600`} />
                  </div>
                  <div className="card-title">{label}</div>
                  <div className="card-desc">{description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Configuration */}
        {testType && questions.length === 0 && (
          <div className="centered-section">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Test Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Enter test name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="5"
                    max="180"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions *</label>
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (!testName.trim()) {
                        alert('Please enter test name first!');
                        return;
                      }
                      setQuestions([]);
                    }}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    Start Creating Questions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Form */}
        {testType && questions.length < numQuestions && testName.trim() && (
          <div className="centered-section">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 text-center w-full">
                  Question {questions.length + 1} of {numQuestions}
                </h2>
                <div className="text-sm text-gray-500">
                  {testType} Question
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                  <textarea
                    value={currentQ.question}
                    onChange={(e) => setCurrentQ({ ...currentQ, question: e.target.value })}
                    placeholder="Enter your question here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    required
                  />
                </div>

                {testType === 'MCQ' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Options *</label>
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((optionLabel, index) => (
                        <div key={optionLabel} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="correctOption"
                            value={optionLabel}
                            checked={currentQ.correctOption === optionLabel}
                            onChange={(e) => setCurrentQ({ ...currentQ, correctOption: e.target.value })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700 w-6">{optionLabel}.</span>
                          <input
                            type="text"
                            value={currentQ.options?.[index] || ''}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${optionLabel}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
                    <input
                      type="number"
                      value={currentQ.marks}
                      onChange={(e) => setCurrentQ({ ...currentQ, marks: Number(e.target.value) })}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {testType === 'Coding' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sample Input</label>
                      <textarea
                        value={currentQ.sampleInput || ''}
                        onChange={(e) => setCurrentQ({ ...currentQ, sampleInput: e.target.value })}
                        placeholder="Enter sample input..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sample Output</label>
                      <textarea
                        value={currentQ.sampleOutput || ''}
                        onChange={(e) => setCurrentQ({ ...currentQ, sampleOutput: e.target.value })}
                        placeholder="Enter expected sample output..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output/Description</label>
                      <textarea
                        value={currentQ.expectedOutput || ''}
                        onChange={(e) => setCurrentQ({ ...currentQ, expectedOutput: e.target.value })}
                        placeholder="Describe the expected output or solution approach..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAddQuestion()}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Question</span>
                  </button>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2 font-medium disabled:opacity-50"
                  >
                    <Sparkles className={`h-4 w-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAI ? 'Generating...' : 'AI Help'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Preview */}
        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Questions Added ({questions.length})</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </div>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {questions.map((q, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Q{index + 1}. {q.question}</h4>
                    <span className="text-sm text-gray-500">{q.marks} marks</span>
                  </div>
                  {q.type === 'mcq' && q.options && (
                    <div className="ml-4 space-y-1">
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className={`text-sm ${
                          String.fromCharCode(65 + optIndex) === q.correctOption ? 'text-emerald-600 font-medium' : 'text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'coding' && (
                    <div className="ml-4 text-sm text-gray-600 space-y-1">
                      {q.sampleInput && <div>Input: {q.sampleInput}</div>}
                      {q.sampleOutput && <div>Output: {q.sampleOutput}</div>}
                      {q.expectedOutput && <div>Expected: {q.expectedOutput}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Question Modal */}
        <AIQuestionModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          testType={testType}
          onAddQuestion={handleAddQuestion}
        />
      </div>
    </div>
  );
}