const mongoose = require('mongoose');
const Submission = require('./models/Submission');
require('./models/User');
require('./models/Test');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function checkSubmissionDetails() {
  try {
    const submissions = await Submission.find({})
      .populate('userId', 'name email')
      .populate('testId', 'name createdBy');
    
    console.log('Total submissions:', submissions.length);
    submissions.forEach(submission => {
      console.log(`- Submission ID: ${submission._id}`);
      console.log(`  Student: ${submission.userId?.name || 'Unknown'} (${submission.userId?.email || 'Unknown'})`);
      console.log(`  Test: ${submission.testId?.name || 'Unknown'}`);
      console.log(`  Test ID: ${submission.testId?._id}`);
      console.log(`  Test Created By: ${submission.testId?.createdBy}`);
      console.log(`  Obtained Marks: ${submission.obtainedMarks}`);
      console.log(`  Submitted At: ${submission.submittedAt}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking submission details:', error);
    process.exit(1);
  }
}

checkSubmissionDetails();