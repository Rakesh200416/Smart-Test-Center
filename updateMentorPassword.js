const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function updateMentorPassword() {
  try {
    // Find the mentor user
    const mentor = await User.findOne({ email: "mentor@example.com" });
    if (!mentor) {
      console.log('No mentor found');
      process.exit(1);
    }
    
    // Update password
    const newPassword = "mentor123";
    const salt = await bcrypt.genSalt(10);
    mentor.password = await bcrypt.hash(newPassword, salt);
    await mentor.save();
    
    console.log('Mentor password updated successfully!');
    console.log('Email:', mentor.email);
    console.log('New password:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating mentor password:', error);
    process.exit(1);
  }
}

updateMentorPassword();