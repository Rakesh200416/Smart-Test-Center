const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  pdfFile: {
    type: String, // Path to uploaded PDF file
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
assignmentSchema.index({ createdBy: 1, createdAt: -1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);