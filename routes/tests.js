const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const auth = require('../middleware/auth');

// ---------------- GET all tests (lightweight with proper question count) ----------------
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find()
      .select('_id name duration totalMarks category type createdAt questions')
      .sort({ createdAt: -1 });

    // Add question count and format response
    const testsWithQuestionCount = tests.map(test => {
      const questionCount = test.questions ? test.questions.length : 0;
      return {
        _id: test._id,
        name: test.name,
        duration: test.duration,
        totalMarks: test.totalMarks,
        category: test.category,
        type: test.type,
        createdAt: test.createdAt,
        questionCount: questionCount,
        questions: undefined // Remove questions array from response to keep it lightweight
      };
    });

    res.json(testsWithQuestionCount);
  } catch (err) {
    console.error("❌ Error fetching tests:", err);
    res.status(500).json({ message: 'Failed to fetch tests', error: err.message });
  }
});

// ---------------- GET single test by ID (with full questions but hidden correct answers) ----------------
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).lean();
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Send questions with numbering, hide correctOption for security
    const clientTest = {
      _id: test._id,
      name: test.name,
      category: test.category,
      type: test.type,
      duration: test.duration,
      totalMarks: test.totalMarks,
      createdAt: test.createdAt,
      questions: (test.questions || []).map((q, index) => ({
        questionNumber: index + 1,
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options || [],
        marks: q.marks || 1,
        sampleInput: q.sampleInput || '',
        sampleOutput: q.sampleOutput || '',
        description: q.description || '',
        // Note: correctOption is intentionally excluded for security
      }))
    };

    res.json(clientTest);
  } catch (err) {
    console.error("❌ Error fetching test:", err);
    res.status(500).json({ message: 'Failed to fetch test', error: err.message });
  }
});

// ---------------- Create test ----------------
router.post('/', auth(), async (req, res) => {
  try {
    const { name, category, type, duration, totalMarks, questions, createdBy } = req.body;

    if (!name || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Test name and questions are required' });
    }

    // Calculate total marks if not provided
    let calculatedTotalMarks = totalMarks;
    if (!calculatedTotalMarks) {
      calculatedTotalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    }

    const test = new Test({
      name,
      category: category || 'mixed',
      type: type || 'mixed',
      duration: duration || 60,
      totalMarks: calculatedTotalMarks,
      questions,
      createdBy: createdBy || req.user?.id
    });

    await test.save();
    res.status(201).json({ message: 'Test created successfully', test });
  } catch (err) {
    console.error('❌ Error creating test:', err);
    res.status(500).json({ message: 'Failed to create test', error: err.message });
  }
});

// ---------------- Update test ----------------
router.put('/:id', auth(), async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({ message: 'Test updated successfully', test });
  } catch (err) {
    console.error('❌ Error updating test:', err);
    res.status(500).json({ message: 'Failed to update test', error: err.message });
  }
});

// ---------------- Delete test ----------------
router.delete('/:id', auth(), async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json({ message: 'Test deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting test:', err);
    res.status(500).json({ message: 'Failed to delete test', error: err.message });
  }
});

module.exports = router;