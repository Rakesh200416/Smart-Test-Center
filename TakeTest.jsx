import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Clock, Play, Send } from "lucide-react";
import api from "../utils/api";
import "./taketest.css";

const INSTRUCTIONS = [
  "• Do not switch tabs, minimize, copy, paste, or take screenshots.",
  "• Your webcam will be monitored during the test.",
  "• You will receive up to 3 warnings for violations. On the 3rd, the test will auto-submit.",
  "• Answer all questions before submitting. Timer is at the top right.",
  "• For coding questions, select your language and write code in the editor.",
];

const LANGUAGES = ["python", "javascript", "java", "cpp"];

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Voice alert function with better error handling
const speakViolation = (message) => {
  try {
    if ('speechSynthesis' in window && window.speechSynthesis) {
      // Cancel any existing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = 0.8;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      
      // Add event listeners for debugging
      utterance.onstart = () => console.log('Speech started:', message);
      utterance.onerror = (event) => console.error('Speech error:', event.error);
      utterance.onend = () => console.log('Speech ended');
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
    }
  } catch (error) {
    console.error('Error in speech synthesis:', error);
  }
};

export default function TakeTest() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [test, setTest] = useState(state?.test || null);
  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [violationReason, setViolationReason] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [cameraStream, setCameraStream] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [cameraError, setCameraError] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);

  // Fetch test data and randomize questions
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        let testData = test;

        if (!testData && id) {
          const res = await api.get(`/tests/${id}`);
          testData = res.data;
          console.log("Fetched testData:", testData);
          setTest(testData);
        }

        if (testData && testData.questions && Array.isArray(testData.questions) && testData.questions.length > 0) {
          const shuffledQuestions = shuffleArray(testData.questions);

          const processedQuestions = shuffledQuestions.map(question => {
            if (question.type === 'mcq' && question.options && question.options.length > 0) {
              const optionsWithIndex = question.options.map((option, index) => ({
                text: option,
                originalIndex: index,
                originalLetter: String.fromCharCode(65 + index)
              }));
              const shuffledOptions = shuffleArray(optionsWithIndex);
              return {
                ...question,
                options: shuffledOptions.map(opt => opt.text),
                optionMapping: shuffledOptions.map(opt => opt.originalLetter),
                originalCorrectOption: question.correctOption
              };
            }
            return question;
          });

          console.log("Processed questions:", processedQuestions);
          setQuestions(processedQuestions);
          setTimeLeft((testData.duration || 60) * 60);
        } else {
          console.error("No questions found in test data:", testData);
          console.log("Test data structure:", JSON.stringify(testData, null, 2));
          
          // Better error message based on the issue
          let errorMessage = "Test Configuration Error";
          let errorDescription = "This test has no questions configured.";
          
          if (!testData) {
            errorMessage = "Test Not Found";
            errorDescription = `Test with ID ${id} could not be found.`;
          } else if (!testData.questions) {
            errorMessage = "Test Configuration Error";
            errorDescription = "This test has no questions configured. Please contact your instructor.";
          } else if (!Array.isArray(testData.questions)) {
            errorMessage = "Test Data Error";
            errorDescription = "Test questions are not properly formatted. Please contact your instructor.";
          } else if (testData.questions.length === 0) {
            errorMessage = "Empty Test";
            errorDescription = "This test contains no questions. Please contact your instructor.";
          }
          
          // Show error modal instead of alert
          setShowResult(true);
          setResultData({
            error: true,
            message: errorDescription,
            reason: errorMessage,
            testId: id
          });
          
          setTimeout(() => {
            navigate("/my-tests");
          }, 5000);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch test:", err);
        // Show error modal instead of alert
        setShowResult(true);
        setResultData({
          error: true,
          message: "Failed to load test. Please check your connection and try again.",
          reason: "Network Error"
        });
        setTimeout(() => {
          navigate("/my-tests");
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [id, test, navigate]);


  // Monitor camera stream tracks for stop event
  useEffect(() => {
    if (!cameraStream || !started) return;

    const videoTracks = cameraStream.getVideoTracks();
    if (videoTracks.length === 0) {
      setCameraError(true);
      const message = "Camera is not available or has been closed. Test will be submitted.";
      alert(message);
      speakViolation("Camera not available. Test will be submitted automatically.");
      setViolationReason("Camera not available");
      setTimeout(() => {
        handleSubmit("Test ended due to camera unavailability");
      }, 2000);
      return;
    }

    const handleTrackEnded = () => {
      if (!started) return; // Don't trigger if test hasn't started
      
      setCameraError(true);
      const message = "Camera has been turned off or disconnected. Test will be submitted.";
      alert(message);
      speakViolation("Camera disconnected. Test will be submitted automatically.");
      setViolationReason("Camera disconnected");
      setTimeout(() => {
        handleSubmit("Test ended due to camera disconnection");
      }, 2000);
    };

    const checkCameraStatus = () => {
      if (!started) return;
      
      const tracks = cameraStream.getVideoTracks();
      const activeTracks = tracks.filter(track => track.readyState === 'live');
      
      if (activeTracks.length === 0) {
        handleTrackEnded();
      }
    };

    // Check camera status every 2 seconds
    const cameraCheckInterval = setInterval(checkCameraStatus, 2000);

    videoTracks.forEach((track) => {
      track.addEventListener("ended", handleTrackEnded);
    });

    return () => {
      clearInterval(cameraCheckInterval);
      videoTracks.forEach((track) => {
        track.removeEventListener("ended", handleTrackEnded);
      });
    };
  }, [cameraStream, started]);

  // Start test: fullscreen + camera
  const startTest = async () => {
    if (cameraError) {
      alert("Cannot start test because camera is not accessible.");
      return;
    }
    
    setStarted(true);
    
    // Enable fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      try {
        await elem.requestFullscreen();
      } catch (e) {
        console.log("Fullscreen not supported");
      }
    }
    
    // Start camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraError(false);
    } catch (e) {
      console.error("Camera access failed:", e);
      alert("Camera access is required for this test!");
      setCameraError(true);
    }
  };

  // Timer countdown with improved auto-submit
  useEffect(() => {
    if (started && timeLeft > 0 && !isSubmitting) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            console.log('Time expired, auto-submitting...');
            speakViolation("Time is up! Test will be submitted automatically.");
            
            // Auto-submit when time expires
            setTimeout(() => {
              if (!isSubmitting) {
                handleSubmit("Time's up!");
              }
            }, 1000);
            return 0;
          }
          
          // Voice warning for last 5 minutes
          if (prev === 300) {
            speakViolation("Warning: Only 5 minutes remaining!");
          }
          // Voice warning for last minute
          if (prev === 60) {
            speakViolation("Warning: Only 1 minute remaining!");
          }
          // Voice warning for last 30 seconds
          if (prev === 30) {
            speakViolation("Warning: Only 30 seconds remaining!");
          }
          
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft, isSubmitting]);

  // Violation detection with improved voice alerts and submission control
  useEffect(() => {
    if (!started || isSubmitting) return;

    const handleViolation = (message) => {
      if (isSubmitting) {
        console.log('Submission in progress, ignoring violation');
        return;
      }
      
      setViolationCount((prevCount) => {
        // Prevent violations beyond 3
        if (prevCount >= 3) {
          console.log('Already at maximum violations, ignoring additional violations');
          return prevCount;
        }
        
        const newViolationCount = prevCount + 1;
        setWarnings((prev) => [...prev, `${message} (Warning ${newViolationCount}/3)`]);

        console.log(`Violation ${newViolationCount}/3:`, message);
        
        // Voice alert for violation
        const violationMessage = `Warning ${newViolationCount} of 3: ${message}`;
        speakViolation(violationMessage);

        if (newViolationCount >= 3) {
          console.log('Third violation reached, auto-submitting...');
          setViolationReason(`Third violation: ${message}`);
          
          const finalMessage = "Three violations detected. Test will be submitted automatically.";
          speakViolation(finalMessage);
          
          // Set submitting state immediately to prevent more violations
          setIsSubmitting(true);
          
          // Auto-submit after a brief delay
          setTimeout(() => {
            handleSubmit(`Test ended due to violations (3/3): ${message}`);
          }, 2000);
        } else {
          // Show warning alert for first two violations
          alert(`⚠️ Warning ${newViolationCount}/3: ${message}`);
        }
        
        return newViolationCount;
      });
    };

    const handleCopy = (e) => {
      // Allow copy/paste in text areas for answers
      if (e.target.tagName === 'TEXTAREA' && e.target.placeholder && 
          (e.target.placeholder.includes('answer') || e.target.placeholder.includes('code'))) {
        return; // Allow copy in answer fields
      }
      e.preventDefault();
      handleViolation("Copying is not allowed!");
    };

    const handlePaste = (e) => {
      // Allow copy/paste in text areas for answers
      if (e.target.tagName === 'TEXTAREA' && e.target.placeholder && 
          (e.target.placeholder.includes('answer') || e.target.placeholder.includes('code'))) {
        return; // Allow paste in answer fields
      }
      e.preventDefault();
      handleViolation("Pasting is not allowed!");
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (e.key === "4" || e.key === "5")) ||
        (e.ctrlKey && e.shiftKey && e.key === "S")
      ) {
        e.preventDefault();
        handleViolation("Screenshots are not allowed!");
      }
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
        handleViolation("Developer tools are not allowed!");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Switching tabs is not allowed!");
      }
    };

    const handleWindowBlur = () => {
      handleViolation("Minimizing or switching applications is not allowed!");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleViolation("Right-click is disabled!");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [started, isSubmitting]); // Added isSubmitting to dependency array

  // Answer change with mapping for shuffled MCQ options
  const handleAnswerChange = (questionId, value) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // For shuffled MCQ questions, map back to original option
    if (currentQuestion?.type === 'mcq' && currentQuestion?.optionMapping) {
      const originalOption = currentQuestion.optionMapping[value.charCodeAt(0) - 65];
      setAnswers((prev) => ({
        ...prev,
        [questionId]: originalOption,
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    }
  };

  // Submit test with proper duplicate prevention
  const handleSubmit = async (reason = "Test completed") => {
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring...');
      return;
    }
    
    console.log('Starting submission process:', reason);
    setIsSubmitting(true);

    try {
      console.log('Submitting test:', {
        testId: id,
        answers: Object.keys(answers),
        reason,
        violationReason
      });
      
      const res = await api.post(`/submissions/${id}/submit`, {
        answers,
        submissionReason: reason,
        violationReason,
      });

      console.log('Submission response:', res.data);

      // Stop camera and exit fullscreen
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (e) {
          console.log('Exit fullscreen error:', e);
        }
      }

      // Show result
      setResultData({
        score: res.data?.score,
        reason,
        violation: violationReason,
      });
      setShowResult(true);

      // Navigate after showing result
      setTimeout(() => {
        navigate("/my-scores");
      }, 3000);
      
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      let errorMessage = "Error submitting test. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = `Error: ${err.response.data.message}`;
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication error. Please login again.";
        navigate('/login');
        return;
      } else if (err.response?.status === 404) {
        errorMessage = "Test not found. Please contact support.";
      }
      
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Run code (mock function for coding questions)
  const handleRunCode = () => {
    speakViolation("Code execution feature will be implemented. Please continue with your solution.");
    alert("Code execution feature will be implemented. For now, please submit your solution.");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = questions.filter((q) => answers[q._id] && answers[q._id].toString().trim() !== '').length;
  const notAnsweredCount = questions.length - answeredCount;
  const allAnswered = answeredCount === questions.length;
  const hasAnyAnswer = answeredCount > 0;

  // Loading state
  if (loading) {
    return (
      <div className="taketest-container flex items-center justify-center min-h-screen text-xl">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  // Instructions page
  if (!test || questions.length === 0) {
    return (
      <div className="taketest-container flex items-center justify-center min-h-screen text-xl">
        <div className="text-center">
          <p>Test not found or has no questions</p>
          <button 
            onClick={() => navigate("/my-tests")} 
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="taketest-container min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{test.name}</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Test Instructions</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {INSTRUCTIONS.map((inst, i) => (
                <li key={i} className="text-sm">{inst}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-semibold text-gray-700">Duration:</span>
              <p className="text-2xl font-bold text-blue-600">{test?.duration || 0} minutes</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-semibold text-gray-700">Total Marks:</span>
              <p className="text-2xl font-bold text-green-600">{test?.totalMarks || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-semibold text-gray-700">Questions:</span>
              <p className="text-2xl font-bold text-purple-600">{questions.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="font-semibold text-gray-700">Category:</span>
              <p className="text-lg font-bold text-orange-600 capitalize">{test?.category || "Mixed"}</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Questions and options have been randomized for this test session.
            </p>
          </div>

          <button
            onClick={startTest}
            disabled={cameraError}
            className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition duration-200 ${
              cameraError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Start Test
          </button>
          {cameraError && (
            <p className="mt-4 text-center text-red-600 font-semibold">
              Camera is not accessible. Please enable your camera to start the test.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Test interface
  const currentQuestion = questions[currentQuestionIndex];
  const isCoding = currentQuestion?.type === "coding";
  const isLongAnswer = currentQuestion?.type === "long";

  return (
    <div className="taketest-container min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Questions */}
      <div className="sidebar bg-white shadow-lg flex flex-col w-80">
        <div className="sidebar-header p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions</h3>
          <div className="questions-grid grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q._id];
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`question-circle w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    isCurrent
                      ? "current"
                      : isAnswered
                      ? "answered"
                      : ""
                  }`}
                  title={isAnswered ? "Answered" : "Not Answered"}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="progress-section p-6">
          <div className="space-y-3">
            <div className="progress-text flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Progress:</span>
              <span className="text-sm font-bold text-gray-800">{answeredCount}/{questions.length}</span>
            </div>
            <div className="progress-bar-container w-full bg-gray-200 rounded-full h-2">
              <div
                className="progress-bar-fill bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="progress-counts flex justify-between text-xs">
              <span className="answered text-green-600 font-medium">Answered: {answeredCount}</span>
              <span className="remaining text-gray-500">Remaining: {notAnsweredCount}</span>
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="warnings-box p-4 mx-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Warnings ({violationCount}/3):</h4>
            <div className="space-y-1">
              {warnings.map((warning, idx) => (
                <p key={idx} className="text-xs text-red-600">{warning}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content flex-1 flex flex-col">
        {/* Top Right - Timer and Webcam */}
        <div className="timer-webcam absolute top-6 right-6 z-10 flex flex-col items-end space-y-4">
          <div
            className={`timer-box flex items-center px-4 py-2 rounded-lg font-bold shadow-lg ${
              timeLeft <= 300 ? "timer-red" : "timer-blue"
            }`}
          >
            <Clock className="mr-2" size={20} />
            {formatTime(timeLeft)}
          </div>
          <video
            id="cameraFeed"
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-32 h-24 bg-black rounded-lg border-2 border-blue-400 shadow-md"
          />
        </div>

        {/* Question Content */}
        <div className="question-content flex-1 p-8 pr-48 min-w-0">
          {isCoding ? (
            <div className="coding-layout h-full flex gap-6">
              {/* Problem Statement */}
              <div className="coding-left w-1/2 bg-white rounded-xl shadow-lg p-6 overflow-y-auto min-w-0">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Problem {currentQuestionIndex + 1}
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 mb-4">{currentQuestion?.question}</p>
                  {currentQuestion?.sampleInput && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800">Sample Input:</h4>
                      <pre className="bg-gray-100 p-2 rounded text-sm">{currentQuestion.sampleInput}</pre>
                    </div>
                  )}
                  {currentQuestion?.sampleOutput && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800">Sample Output:</h4>
                      <pre className="bg-gray-100 p-2 rounded text-sm">{currentQuestion.sampleOutput}</pre>
                    </div>
                  )}
                  <div className="marks-text text-sm text-gray-500">
                    <strong>Marks:</strong> {currentQuestion?.marks || 0}
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="coding-right w-1/2 bg-white rounded-xl shadow-lg p-6 flex flex-col min-w-0">
                <div className="lang-select-container flex items-center gap-4 mb-4">
                  <label className="font-semibold text-gray-700">Language:</label>
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="border rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={answers[currentQuestion._id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                  className="flex-1 border rounded-lg p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Write your ${selectedLang} code here...`}
                  onPaste={(e) => e.stopPropagation()}
                  onCopy={(e) => e.stopPropagation()}
                  style={{ minHeight: '300px' }}
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleRunCode}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Play size={16} className="mr-2" />
                    Run Code
                  </button>

                  {(hasAnyAnswer || timeLeft === 0 || violationCount >= 3) && (
                    <button
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className={`flex items-center px-6 py-2 text-white rounded-lg transition disabled:opacity-60 ${
                        allAnswered ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Send size={16} className="mr-2" />
                      {isSubmitting ? "Submitting..." : allAnswered ? "Submit Test" : "Submit Partial"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Question {currentQuestionIndex + 1}
                    </h2>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {currentQuestion?.marks || 0} marks
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {currentQuestion?.question}
                  </p>
                </div>

                {/* MCQ Options */}
                {currentQuestion?.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      const isSelected = answers[currentQuestion._id] === (currentQuestion.optionMapping ? currentQuestion.optionMapping[idx] : optionLetter);

                      return (
                        <label
                          key={idx}
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={currentQuestion._id}
                            value={optionLetter}
                            checked={isSelected}
                            onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                            isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <span className="mr-3 font-semibold text-gray-600">{optionLetter}.</span>
                          <span className="text-gray-700">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Long Answer */}
                {isLongAnswer && (
                  <div className="mb-6">
                    <textarea
                      value={answers[currentQuestion._id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      rows={8}
                      className="w-full border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      placeholder="Type your detailed answer here..."
                      onPaste={(e) => e.stopPropagation()}
                      onCopy={(e) => e.stopPropagation()}
                      style={{ minHeight: '200px' }}
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                  >
                    Previous
                  </button>

                  <div className="flex gap-3">
                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Next
                      </button>
                    ) : (
                      (hasAnyAnswer || timeLeft === 0 || violationCount >= 3) && (
                        <button
                          onClick={() => handleSubmit()}
                          disabled={isSubmitting}
                          className={`px-8 py-2 text-white rounded-lg font-bold transition disabled:opacity-60 ${
                            allAnswered ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isSubmitting ? "Submitting..." : allAnswered ? "Submit Test" : "Submit Partial"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            {resultData?.error ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-red-600">{resultData.reason || 'Error!'}</h2>
                </div>
                <div className="text-center mb-6">
                  <p className="text-red-600 font-semibold mb-2">{resultData.message}</p>
                  {resultData.testId && (
                    <p className="text-gray-500 text-sm">Test ID: {resultData.testId}</p>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate("/my-tests")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Back to Tests
                  </button>
                </div>
                <p className="text-center text-gray-500 text-sm mt-4">Redirecting automatically in 5 seconds...</p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-green-600">Test Submitted!</h2>
                </div>
                <div className="text-center mb-4">
                  <p className="text-lg mb-2">
                    Score: <span className="font-bold text-blue-600">
                      {resultData?.score?.obtainedMarks || 0} / {resultData?.score?.totalMarks || 0}
                    </span>
                  </p>
                  {resultData?.violation && (
                    <p className="text-red-600 font-semibold mb-2">
                      Violation: {resultData.violation}
                    </p>
                  )}
                  <p className="text-gray-600">{resultData?.reason}</p>
                </div>
                <p className="text-center text-gray-500">Redirecting to My Scores...</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    
  );
}