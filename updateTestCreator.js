const mongoose = require('mongoose');
const Test = require('./models/Test');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function updateTestCreator() {
  try {
    // Find the mentor user
    const mentor = await User.findOne({ email: "mentor@example.com" });
    if (!mentor) {
      console.log('No mentor found');
      process.exit(1);
    }
    
    // Update the test to be created by this mentor
    const result = await Test.updateMany({}, { createdBy: mentor._id });
    
    console.log('Updated tests to be created by mentor:', mentor.name);
    console.log('Modified count:', result.modifiedCount);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating test creator:', error);
    process.exit(1);
  }
}

updateTestCreator();