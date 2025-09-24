const mongoose = require('mongoose');
const Submission = require('./models/Submission');
require('./models/User');
require('./models/Test');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function checkSubmissions() {
  try {
    const submissions = await Submission.find({}).populate('userId', 'name').populate('testId', 'name');
    console.log('Total submissions:', submissions.length);
    console.log('Submissions:', JSON.stringify(submissions, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error checking submissions:', error);
    process.exit(1);
  }
}

checkSubmissions();