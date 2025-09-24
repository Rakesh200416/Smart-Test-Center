// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const auth = require("../middleware/auth");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", auth("admin"), async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ role: "student" });
    const mentorsCount = await User.countDocuments({ role: "mentor" });
    const quizzesCount = await Quiz.countDocuments();

    // Example: best performers (replace with actual logic)
    const bestStudent = await User.findOne({ role: "student" }).sort({ score: -1 });
    const bestMentor = await User.findOne({ role: "mentor" }).sort({ rating: -1 });

    res.json({
      studentsCount,
      mentorsCount,
      quizzesCount,
      bestStudent,
      bestMentor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get users by role
router.get("/users", protect, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    
    const users = await User.find(filter)
      .select('name email role createdAt')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
