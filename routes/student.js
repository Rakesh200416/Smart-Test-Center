const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const Score = require("../models/Score");
const Submission = require("../models/Submission");
const { protect } = require("../middleware/authMiddleware");

// Get student dashboard stats
router.get("/stats", protect, async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    console.log('Fetching stats for student:', studentId);

    // Get total available tests
    const totalTests = await Test.countDocuments();
    console.log('Total tests available:', totalTests);

    // Get completed exams (submissions) - fix field name
    const completedExams = await Submission.countDocuments({ userId: studentId });
    console.log('Completed exams (submissions):', completedExams);

    // Get attempted tests from both Score and Submission collections
    const scores = await Score.find({ student: studentId });
    const submissions = await Submission.find({ userId: studentId });
    console.log('Scores found:', scores.length);
    console.log('Submissions found:', submissions.length);
    
    // Calculate average score from submissions (more reliable)
    let avgScore = 0;
    if (submissions.length > 0) {
      const validSubmissions = submissions.filter(sub => sub.obtainedMarks !== undefined && sub.obtainedMarks !== null);
      if (validSubmissions.length > 0) {
        const totalScore = validSubmissions.reduce((sum, submission) => {
          // Get total marks from the submission or default
          const totalMarks = submission.totalMarks || submission.testId?.totalMarks || 100;
          const obtainedMarks = submission.obtainedMarks || 0;
          const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
          return sum + percentage;
        }, 0);
        avgScore = Math.round(totalScore / validSubmissions.length);
      }
    }
    
    // If no submissions, try scores collection
    if (avgScore === 0 && scores.length > 0) {
      const totalScore = scores.reduce((sum, score) => {
        const percentage = (score.obtainedMarks / score.totalMarks) * 100;
        return sum + percentage;
      }, 0);
      avgScore = Math.round(totalScore / scores.length);
    }

    // Get attempted tests count (max of scores or submissions)
    const attemptedTests = Math.max(scores.length, submissions.length);
    
    console.log('Final stats:', {
      totalTests,
      completedExams,
      avgScore,
      attemptedTests
    });

    res.json({
      totalTests,
      completedExams,
      avgScore,
      attemptedTests
    });
  } catch (err) {
    console.error("Error fetching student stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// 🔹 Get all available tests (list view)
router.get("/tests", protect, async (req, res) => {
  try {
    const tests = await Test.find().select("_id name duration totalMarks");
    res.json({ tests });
  } catch (err) {
    console.error("Error fetching tests:", err);
    res.status(500).json({ message: "Failed to fetch tests" });
  }
});

// 🔹 Get a single test by ID (full details including questions)
router.get("/tests/:id", protect, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Ensure questions always have options array
    const questionsWithOptions = test.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options || [], // <- options must be an array
      marks: q.marks || 1,
      correctAnswer: q.correctOption || null // optional
    }));

    res.json({
      _id: test._id,
      name: test.name,
      duration: test.duration,
      totalMarks: test.totalMarks,
      questions: questionsWithOptions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch test" });
  }
});

// 🔹 Submit test and save score
router.post("/tests/:id/submit", protect, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  try {
    const test = await Test.findById(id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    let obtainedMarks = 0;
    test.questions.forEach((q) => {
      if (answers[q._id] && answers[q._id] === q.correctOption) {
        obtainedMarks += q.marks || 1;
      }
    });

    const score = new Score({
      student: req.user._id,
      testName: test.name,
      totalMarks: test.totalMarks,
      obtainedMarks,
      testId: test._id,
    });

    await score.save();
    res.json({ message: "Test submitted successfully", score });
  } catch (err) {
    console.error("Error submitting test:", err);
    res.status(500).json({ message: "Failed to submit test" });
  }
});

// 🔹 Get all scores of logged-in student
router.get("/scores", protect, async (req, res) => {
  try {
    const scores = await Score.find({ student: req.user._id });
    res.json({ scores });
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ message: "Failed to fetch scores" });
  }
});

module.exports = router;
