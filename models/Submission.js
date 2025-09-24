const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Test", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  answers: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  obtainedMarks: { 
    type: Number, 
    default: 0 
  },
  submissionReason: { 
    type: String, 
    default: "Test completed" 
  },
  violationReason: String,
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  category: String,
  testName: String, // Cache test name for easier querying
});

// Index for faster queries
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ testId: 1 });

module.exports = mongoose.model("Submission", submissionSchema);