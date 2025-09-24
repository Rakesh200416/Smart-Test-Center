const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mcq', 'long', 'coding', 'mixed'],
    default: 'mixed'
  },
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'long', 'coding', 'mixed'],
    default: 'mixed'
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    default: 60
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1,
    default: 0
  },
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['mcq', 'long', 'coding'],
      default: 'mcq'
    },
    options: [{
      type: String,
      trim: true
    }],
    correctOption: {
      type: String,
      trim: true
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    sampleInput: {
      type: String,
      trim: true
    },
    sampleOutput: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
testSchema.index({ createdBy: 1, createdAt: -1 });
testSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model('Test', testSchema);