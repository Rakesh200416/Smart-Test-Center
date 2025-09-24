const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function listUsers() {
  try {
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      console.log(`  Password hash: ${user.password}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();