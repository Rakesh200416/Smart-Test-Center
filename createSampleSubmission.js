const mongoose = require('mongoose');
const Submission = require('./models/Submission');
const Test = require('./models/Test');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function createSampleSubmission() {
  try {
    // Find a test
    const test = await Test.findOne({});
    if (!test) {
      console.log('No test found');
      process.exit(1);
    }
    
    // Find or create a student user
    let student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log('No student found, creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      student = new User({
        name: 'Sample Student',
        email: 'student@example.com',
        password: hashedPassword,
        role: 'student'
      });
      await student.save();
      console.log('Sample student created');
    }
    
    // Create a sample submission
    const submission = new Submission({
      testId: test._id,
      userId: student._id,
      answers: {
        // Sample answers for MCQ questions
      },
      obtainedMarks: 3,
      submissionReason: "Test completed",
      violationReason: "",
      category: "mcq",
      testName: test.name,
      submittedAt: new Date()
    });
    
    await submission.save();
    
    console.log('Sample submission created successfully!');
    console.log('Submission ID:', submission._id);
    console.log('Test Name:', test.name);
    console.log('Student Name:', student.name);
    console.log('Obtained Marks:', submission.obtainedMarks);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample submission:', error);
    process.exit(1);
  }
}

createSampleSubmission();