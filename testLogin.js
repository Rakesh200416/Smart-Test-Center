const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function testLogin() {
  try {
    // Find the mentor user
    const user = await User.findOne({ email: "mentor@example.com" });
    if (!user) {
      console.log('No mentor found');
      process.exit(1);
    }
    
    // Check password using the model's method
    const isMatch = await user.matchPassword('mentor123');
    if (!isMatch) {
      console.log('Password does not match');
      process.exit(1);
    }
    console.log('Password matched: mentor123');
    
    // Generate token
    const payload = {
      id: user.id,
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret_key', {
      expiresIn: '7d',
    });
    
    console.log('Login successful!');
    console.log('User ID:', user._id);
    console.log('User Name:', user.name);
    console.log('Token:', token);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during login test:', error);
    process.exit(1);
  }
}

testLogin();