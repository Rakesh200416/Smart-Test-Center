// types.js (or testTypes.js)
export const Question = {
  id: '',
  type: '', // 'MCQ' | 'Long' | 'Coding'
  question: '',
  options: [],       // optional
  correctOption: '', // optional
  marks: 0,
  expectedOutput: '', // optional
};

export const Test = {
  id: '',
  name: '',
  type: '', // 'MCQ' | 'Long' | 'Coding'
  questions: [], // array of Question objects
  totalMarks: 0,
  duration: 0, // in minutes
  createdAt: null,
  createdBy: '',
};

export const TestAttempt = {
  id: '',
  testId: '',
  testName: '',
  answers: {}, // key: questionId, value: string or array of strings
  score: 0,
  totalMarks: 0,
  startTime: null,
  endTime: null,
  status: '', // 'in_progress' | 'submitted' | 'evaluated'
  resultPublishedAt: null,
};
