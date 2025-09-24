// Mock AI service that simulates realistic question generation
export const generateAIQuestion = async (testType) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const mockQuestions = {
    MCQ: [
      {
        question: "What is the time complexity of binary search algorithm?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctOption: "B",
        marks: 2,
      },
      {
        question: "Which of the following is not a JavaScript data type?",
        options: ["String", "Boolean", "Float", "Undefined"],
        correctOption: "C",
        marks: 1,
      },
      {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        correctOption: "B",
        marks: 1,
      },
      {
        question: "Which HTTP method is used to update existing data?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctOption: "C",
        marks: 2,
      },
    ],
    Long: [
      {
        question: "Explain the concept of Object-Oriented Programming and its four main principles. Provide examples for each principle.",
        marks: 10,
      },
      {
        question: "Describe the differences between SQL and NoSQL databases. When would you choose one over the other?",
        marks: 8,
      },
      {
        question: "What is the purpose of version control systems? Explain the benefits of using Git in software development.",
        marks: 6,
      },
      {
        question: "Discuss the importance of responsive web design and explain three key techniques to achieve it.",
        marks: 8,
      },
    ],
    Coding: [
      {
        question: "Write a function that finds the maximum element in an array of integers. The function should handle edge cases like empty arrays.",
        expectedOutput: "Function should return the maximum number in the array, or handle empty array appropriately",
        marks: 5,
      },
      {
        question: "Implement a function that checks if a given string is a palindrome. Ignore case sensitivity and spaces.",
        expectedOutput: "Function should return true for palindromes like 'A man a plan a canal Panama', false otherwise",
        marks: 6,
      },
      {
        question: "Create a function that calculates the factorial of a given number using recursion.",
        expectedOutput: "Function should return n! for positive integers, handle edge cases for 0 and negative numbers",
        marks: 4,
      },
      {
        question: "Write a function that merges two sorted arrays into a single sorted array without using built-in sort methods.",
        expectedOutput: "Function should efficiently merge [1,3,5] and [2,4,6] into [1,2,3,4,5,6]",
        marks: 7,
      },
    ],
  };

  const questions = mockQuestions[testType];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  return randomQuestion;
};
