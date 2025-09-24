// backend/controller/submitTest.js (example)
const Test = require("../models/Test");
const Submission = require("../models/Submission");

const submitTest = async (req, res) => {
  try {
    const { testId, userId, answers } = req.body;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).send({ error: "Test not found" });

    let obtainedMarks = 0;

    for (const q of test.questions) {
      const userAnswerText = answers[q._id]; // e.g., "Cascading Style Sheets"
      if (!userAnswerText) continue;

      // Find the option letter that matches the submitted answer text
      const index = q.options.indexOf(userAnswerText);
      const selectedOption = index !== -1 ? String.fromCharCode(65 + index) : null; // A, B, C, D

      if (selectedOption === q.correctOption) {
        obtainedMarks += q.marks || 1;
      }
    }

    const submission = await Submission.create({
      testId,
      userId,
      answers,
      obtainedMarks,
      category: test.category || "unknown",
    });

    res.status(200).json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

module.exports = { submitTest };
