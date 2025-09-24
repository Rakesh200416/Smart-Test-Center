const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", protect, async (req, res) => {
  try {
    const mentorId = req.user._id;

    // Get total tests created by mentor
    const totalTests = await Test.countDocuments({ createdBy: mentorId });
    
    // Get total assignments given
    const totalAssignments = await Assignment.countDocuments({ createdBy: mentorId });
    
    // Get total notifications sent
    const totalNotifications = await Notification.countDocuments({ createdBy: mentorId });
    
    // Get all tests created by this mentor
    const mentorTests = await Test.find({ createdBy: mentorId }).select('_id');
    const testIds = mentorTests.map(test => test._id);
    
    console.log('Mentor tests found:', testIds);
    
    // Get total submissions for mentor's tests (completed exams)
    const totalSubmissions = await Submission.countDocuments({ testId: { $in: testIds } });
    
    // Get active students (unique students who have taken tests)
    const activeStudents = await Submission.distinct('userId', { testId: { $in: testIds } });
    const activeStudentCount = activeStudents.length;
    
    console.log('Submissions count:', totalSubmissions);
    console.log('Active students:', activeStudentCount);
    
    // Calculate average score from submissions
    const submissions = await Submission.find({ testId: { $in: testIds } });
    let avgScore = 0;
    if (submissions.length > 0) {
      const totalScore = submissions.reduce((sum, submission) => {
        // Handle both old and new submission formats
        const obtainedMarks = submission.obtainedMarks || (submission.score?.obtainedMarks) || 0;
        const totalMarks = submission.totalMarks || (submission.score?.totalMarks) || 0;
        if (totalMarks > 0) {
          const percentage = (obtainedMarks / totalMarks) * 100;
          return sum + percentage;
        }
        return sum;
      }, 0);
      avgScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;
    }

    res.json({ 
      totalTests, 
      activeStudents: activeStudentCount, 
      completedExams: totalSubmissions, 
      avgScore,
      totalAssignments,
      totalNotifications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;