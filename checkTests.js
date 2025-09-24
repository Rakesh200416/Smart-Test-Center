const mongoose = require('mongoose');
const Test = require('./models/Test');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function checkTests() {
  try {
    const tests = await Test.find({}).populate('createdBy', 'name email');
    console.log('Total tests:', tests.length);
    tests.forEach(test => {
      console.log(`- ${test.name} (ID: ${test._id})`);
      console.log(`  Created by: ${test.createdBy?.name || 'Unknown'} (${test.createdBy?.email || 'Unknown'})`);
      console.log(`  Category: ${test.category}`);
      console.log(`  Questions: ${test.questions?.length || 0}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking tests:', error);
    process.exit(1);
  }
}

checkTests();