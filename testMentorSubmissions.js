const mongoose = require('mongoose');
const Test = require('./models/Test');
const Submission = require('./models/Submission');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function testMentorSubmissions() {
  try {
    // Find the mentor user
    const mentor = await User.findOne({ email: "mentor@example.com" });
    console.log('Mentor found:');
    console.log(`  ID: ${mentor._id}`);
    console.log(`  Name: ${mentor.name}`);
    console.log(`  Email: ${mentor.email}`);
    
    // Find all tests created by this mentor
    const mentorTests = await Test.find({ createdBy: mentor._id }).select('_id');
    const testIds = mentorTests.map(test => test._id);
    console.log('Mentor tests found:', testIds);
    
    // Find all submissions for these tests
    const submissions = await Submission.find({ testId: { $in: testIds } })
      .populate('userId', 'name email')
      .populate('testId', 'name totalMarks')
      .sort({ submittedAt: -1 });
    
    console.log('Submissions found:', submissions.length);
    submissions.forEach(submission => {
      console.log(`- Submission ID: ${submission._id}`);
      console.log(`  Student: ${submission.userId?.name || 'Unknown'} (${submission.userId?.email || 'Unknown'})`);
      console.log(`  Test: ${submission.testId?.name || 'Unknown'}`);
      console.log(`  Obtained Marks: ${submission.obtainedMarks}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing mentor submissions:', error);
    process.exit(1);
  }
}

testMentorSubmissions();