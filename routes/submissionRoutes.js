const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Test = require("../models/Test");
const auth = require("../middleware/auth");
const { protect } = require("../middleware/authMiddleware");

// Submit a test with improved scoring logic and duplicate prevention
router.post("/:testId/submit", protect, async (req, res) => {
  try {
    const { answers, submissionReason, violationReason } = req.body;
    const testId = req.params.testId;
    const userId = req.user._id;
    
    console.log('Submission attempt:', {
      testId,
      userId,
      hasAnswers: !!answers,
      answerCount: answers ? Object.keys(answers).length : 0
    });
    
    // Check for existing submission
    const existingSubmission = await Submission.findOne({
      testId: testId,
      userId: userId
    });
    
    if (existingSubmission) {
      console.log('Duplicate submission attempt detected for user:', userId, 'test:', testId);
      return res.status(400).json({ 
        message: "Test already submitted. Multiple submissions are not allowed.",
        existingSubmission: {
          submittedAt: existingSubmission.submittedAt,
          obtainedMarks: existingSubmission.obtainedMarks
        }
      });
    }
    
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    
    if (!test.questions || !Array.isArray(test.questions) || test.questions.length === 0) {
      return res.status(400).json({ message: "Test has no questions configured" });
    }

    let obtainedMarks = 0;
    const totalMarks = test.totalMarks || 0;
    console.log("Evaluating test submission:", {
      testId: test._id,
      userId: req.user?._id,
      userAuthenticated: !!req.user,
      totalQuestions: test.questions.length,
      answersReceived: Object.keys(answers || {}).length
    });

    // Calculate score based on question type
    test.questions.forEach((question, index) => {
      const userAnswer = answers?.[question._id];
      console.log(`Question ${index + 1}:`, {
        questionId: question._id,
        type: question.type,
        correctOption: question.correctOption,
        userAnswer: userAnswer,
        marks: question.marks || 1
      });
      
      if (!userAnswer) {
        console.log(`Question ${index + 1}: No answer provided`);
        return; // Skip unanswered questions
      }

      if (question.type === "mcq") {
        // For MCQ, both userAnswer and correctOption should be letters (A, B, C, D)
        if (userAnswer.toUpperCase() === question.correctOption.toUpperCase()) {
          obtainedMarks += question.marks || 1;
          console.log(`Question ${index + 1}: Correct! +${question.marks || 1} marks`);
        } else {
          console.log(`Question ${index + 1}: Incorrect. Expected: ${question.correctOption}, Got: ${userAnswer}`);
        }
      } else if (question.type === "long") {
        // For long answers, check if there's meaningful content
        const answerLength = userAnswer.trim().length;
        if (answerLength > 10) { // At least 10 characters for meaningful answer
          // Give partial marks based on answer length and complexity
          const maxMarks = question.marks || 1;
          const partialMarks = Math.min(maxMarks, Math.floor(maxMarks * Math.min(answerLength / 100, 1)));
          obtainedMarks += partialMarks;
          console.log(`Question ${index + 1}: Long answer (${answerLength} chars) +${partialMarks} marks`);
        } else {
          console.log(`Question ${index + 1}: Answer too short (${answerLength} chars)`);
        }
      } else if (question.type === "coding") {
        // For coding questions, check if there's code content
        const codeLength = userAnswer.trim().length;
        if (codeLength > 20) { // At least 20 characters for meaningful code
          // Give partial marks for code attempt
          const maxMarks = question.marks || 1;
          const partialMarks = Math.floor(maxMarks * 0.6); // Give 60% for code attempt
          obtainedMarks += partialMarks;
          console.log(`Question ${index + 1}: Code attempt (${codeLength} chars) +${partialMarks} marks`);
        } else {
          console.log(`Question ${index + 1}: Code too short (${codeLength} chars)`);
        }
      }
    });

    console.log("Final score calculation:", {
      obtainedMarks,
      totalMarks,
      percentage: totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0
    });

    if (!req.user || !userId) {
      return res.status(401).json({ message: "Authentication required. Please login." });
    }

    const submission = new Submission({
      testId: test._id,
      userId: userId,
      answers,
      obtainedMarks,
      submissionReason: submissionReason || "Test completed",
      violationReason,
      category: test.category || "unknown",
      testName: test.name
    });

    await submission.save();

    // Populate test details for response
    await submission.populate('testId', 'name totalMarks category');

    res.json({
      message: "Test submitted successfully",
      score: { obtainedMarks, totalMarks },
      submission,
    });
  } catch (err) {
    console.error("❌ Submit error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get submissions for logged-in user
router.get("/my", auth(), async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate("testId", "name totalMarks category duration")
      .sort({ submittedAt: -1 }); // Most recent first

    res.json(submissions);
  } catch (err) {
    console.error("❌ Fetch submissions error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get single submission by ID
router.get("/:id", auth(), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate("testId");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    console.error("❌ Fetch submission error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all submissions for mentor's tests
router.get("/mentor", protect, async (req, res) => {
  try {
    // Find all tests created by this mentor
    const mentorTests = await Test.find({ createdBy: req.user._id }).select('_id');
    const testIds = mentorTests.map(test => test._id);
    
    // Find all submissions for these tests
    const submissions = await Submission.find({ testId: { $in: testIds } })
      .populate('userId', 'name email')
      .populate('testId', 'name totalMarks')
      .sort({ submittedAt: -1 });
    
    // Transform the data to match expected format
    const formattedSubmissions = submissions.map(submission => ({
      _id: submission._id,
      student: submission.userId,
      test: submission.testId,
      obtainedMarks: submission.obtainedMarks,
      totalMarks: submission.testId?.totalMarks || 0,
      submittedAt: submission.submittedAt,
      submissionReason: submission.submissionReason,
      violationReason: submission.violationReason,
      timeTaken: submission.timeTaken
    }));
    
    res.json(formattedSubmissions);
  } catch (err) {
    console.error('Error fetching mentor submissions:', err);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
});

// Alternative endpoint for frontend compatibility
router.get("/all-for-mentor", protect, async (req, res) => {
  try {
    // Find all tests created by this mentor
    const mentorTests = await Test.find({ createdBy: req.user._id }).select('_id');
    const testIds = mentorTests.map(test => test._id);
    
    // Find all submissions for these tests
    const submissions = await Submission.find({ testId: { $in: testIds } })
      .populate('userId', 'name email')
      .populate('testId', 'name totalMarks')
      .sort({ submittedAt: -1 });
    
    // Transform the data to match expected format
    const formattedSubmissions = submissions.map(submission => ({
      _id: submission._id,
      student: submission.userId,
      test: submission.testId,
      obtainedMarks: submission.obtainedMarks,
      totalMarks: submission.testId?.totalMarks || 0,
      submittedAt: submission.submittedAt,
      submissionReason: submission.submissionReason,
      violationReason: submission.violationReason,
      timeTaken: submission.timeTaken
    }));
    
    res.json(formattedSubmissions);
  } catch (err) {
    console.error('Error fetching mentor submissions:', err);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
});


module.exports = router;