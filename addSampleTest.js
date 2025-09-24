const mongoose = require('mongoose');
const Test = require('./models/Test');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stc-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

async function addSampleTest() {
  try {
    // Find a mentor user to assign as creator
    let mentor = await User.findOne({ role: 'mentor' });
    
    if (!mentor) {
      console.log('No mentor found, creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      mentor = new User({
        name: 'Sample Mentor',
        email: 'mentor@example.com',
        password: hashedPassword,
        role: 'mentor'
      });
      await mentor.save();
      console.log('Sample mentor created');
    }
    
    // Sample test data with multiple question types
    const sampleTest = {
      name: "Full Stack Development Test",
      category: "mixed",
      type: "mixed",
      duration: 30,
      totalMarks: 20,
      questions: [
        {
          question: "What does HTML stand for?",
          type: "mcq",
          options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyperlinking Text Mark Language"],
          correctOption: "A",
          marks: 2
        },
        {
          question: "Which of the following is a JavaScript framework?",
          type: "mcq",
          options: ["Django", "Laravel", "React", "Ruby on Rails"],
          correctOption: "C",
          marks: 2
        },
        {
          question: "What is the default port for HTTP?",
          type: "mcq",
          options: ["80", "443", "8080", "3000"],
          correctOption: "A",
          marks: 2
        },
        {
          question: "Explain the difference between let, var, and const in JavaScript. Provide examples for each.",
          type: "long",
          marks: 5
        },
        {
          question: "Describe the MVC architecture pattern and its benefits in web development.",
          type: "long",
          marks: 4
        },
        {
          question: "Write a JavaScript function that takes an array of numbers and returns the sum of all even numbers.",
          type: "coding",
          sampleInput: "[1, 2, 3, 4, 5, 6]",
          sampleOutput: "12",
          marks: 5
        }
      ],
      createdBy: mentor._id
    };

    // Delete existing tests (for fresh start)
    await Test.deleteMany({});
    console.log('Deleted existing tests');

    // Create the new test
    const test = new Test(sampleTest);
    await test.save();
    
    console.log('Sample test created successfully!');
    console.log('Test ID:', test._id);
    console.log('Test Name:', test.name);
    console.log('Questions:', test.questions.length);
    console.log('Total Marks:', test.totalMarks);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample test:', error);
    process.exit(1);
  }
}

addSampleTest();