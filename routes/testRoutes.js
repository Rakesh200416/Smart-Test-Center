const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const auth = require('../middleware/auth');
const { protect } = require('../middleware/authMiddleware');

// Test route to check if server is working
router.get('/health', (req, res) => {
  res.json({ message: 'Test routes are working', timestamp: new Date().toISOString() });
});

// GET all tests (lightweight with question count)
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find()
      .select('_id name duration totalMarks category type createdAt questions')
      .sort({ createdAt: -1 });

    // Add question count to each test
    const testsWithQuestionCount = tests.map(test => ({
      _id: test._id,
      name: test.name,
      duration: test.duration,
      totalMarks: test.totalMarks,
      category: test.category,
      type: test.type,
      createdAt: test.createdAt,
      questionCount: test.questions ? test.questions.length : 0
    }));

    res.json(testsWithQuestionCount);
  } catch (err) {
    console.error("❌ Error fetching tests:", err);
    res.status(500).json({ message: 'Failed to fetch tests', error: err.message });
  }
});

// GET single test by ID (with full questions but hidden correct answers)
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).lean();
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Send questions with proper structure, hide correctOption for security
    const clientTest = {
      _id: test._id,
      name: test.name,
      category: test.category,
      type: test.type,
      duration: test.duration,
      totalMarks: test.totalMarks,
      createdAt: test.createdAt,
      questions: (test.questions || []).map((q, index) => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options || [],
        marks: q.marks || 1,
        sampleInput: q.sampleInput || '',
        sampleOutput: q.sampleOutput || '',
        description: q.description || ''
        // Note: correctOption is intentionally excluded for security
      }))
    };

    res.json(clientTest);
  } catch (err) {
    console.error("❌ Error fetching test:", err);
    res.status(500).json({ message: 'Failed to fetch test', error: err.message });
  }
});

// Create test with credentials (no token required)
router.post('/create-with-credentials', async (req, res) => {
  try {
    const { email, password, testData } = req.body;
    console.log('Creating test with credentials for:', email);
    
    if (!email || !password || !testData) {
      return res.status(400).json({ message: 'Email, password and test data are required' });
    }
    
    // Find and verify user
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is mentor
    if (user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can create tests' });
    }
    
    // Validate test data
    const { name, category, type, duration, totalMarks, questions } = testData;
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
      createdBy: user._id
    });
    
    console.log('Saving test:', test.name);
    await test.save();
    console.log('Test saved successfully with ID:', test._id);
    
    res.status(201).json({ 
      message: 'Test created successfully',
      test: test
    });
  } catch (err) {
    console.error('❌ Error creating test with credentials:', err);
    res.status(500).json({ 
      message: 'Failed to create test', 
      error: err.message 
    });
  }
});

// Create test (protected route)
router.post('/', protect, async (req, res) => {
  try {
    console.log('Creating test with user:', req.user?._id);
    console.log('Request body:', req.body);
    
    const { name, category, type, duration, totalMarks, questions, createdBy } = req.body;

    // Validate required fields
    if (!name || !questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ 
        message: 'Test name and questions are required' 
      });
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
      createdBy: createdBy || req.user?._id
    });

    console.log('Saving test:', test.name);
    await test.save();
    console.log('Test saved successfully with ID:', test._id);
    
    res.status(201).json({ 
      message: 'Test created successfully',
      test: test
    });
  } catch (err) {
    console.error('❌ Error creating test:', err);
    res.status(500).json({ 
      message: 'Failed to create test', 
      error: err.message 
    });
  }
});

// Update test
router.put('/:id', protect, async (req, res) => {
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
    res.status(500).json({ 
      message: 'Failed to update test', 
      error: err.message 
    });
  }
});

// Delete test
router.delete('/:id', protect, async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json({ message: 'Test deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting test:', err);
    res.status(500).json({ 
      message: 'Failed to delete test', 
      error: err.message 
    });
  }
});

module.exports = router;