const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/assignments');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// GET all assignments for mentor
router.get('/mentor', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .populate('students', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching mentor assignments:', err);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
});

// GET all assignments for student
router.get('/student', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      $or: [
        { students: req.user._id || req.user.id }, // Assignments specifically assigned to this student
        { students: { $size: 0 } } // Assignments with empty students array (assigned to all)
      ],
      isActive: true 
    })
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });
    
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching student assignments:', err);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
});

// CREATE new assignment
router.post('/', protect, upload.single('pdfFile'), async (req, res) => {
  try {
    const { title, description, dueDate, students } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    // Get student IDs - if none specified, leave empty for broadcast to all students
    let studentIds = students ? JSON.parse(students) : [];

    const assignment = new Assignment({
      title,
      description,
      pdfFile: `/uploads/assignments/${req.file.filename}`,
      originalFilename: req.file.originalname,
      dueDate: new Date(dueDate),
      createdBy: req.user._id,
      students: studentIds  // Empty array means broadcast to all students
    });

    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('students', 'name email')
      .populate('createdBy', 'name');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: populatedAssignment
    });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
});

// UPDATE assignment
router.put('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('students', 'name email')
      .populate('createdBy', 'name');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ message: 'Failed to update assignment' });
  }
});

// DELETE assignment
router.delete('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Delete the PDF file
    const filePath = path.join(__dirname, '..', assignment.pdfFile);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ message: 'Failed to delete assignment' });
  }
});

// DOWNLOAD assignment PDF
router.get('/download/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has access to this assignment
    // Access is granted if:
    // 1. User is the creator (mentor)
    // 2. User is in the students list
    // 3. Students list is empty (broadcast to all students)
    const hasAccess = assignment.createdBy.toString() === req.user._id.toString() ||
                     assignment.students.includes(req.user._id) ||
                     assignment.students.length === 0;
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', assignment.pdfFile);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, assignment.originalFilename);
  } catch (err) {
    console.error('Error downloading assignment:', err);
    res.status(500).json({ message: 'Failed to download assignment' });
  }
});

module.exports = router;