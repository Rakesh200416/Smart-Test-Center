const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function checkUserById() {
  try {
    // Check the user who created the test
    const user = await User.findById('68cf550ac2f000d58f91c968');
    console.log('Test creator:');
    console.log(`  ID: ${user._id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
}

checkUserById();