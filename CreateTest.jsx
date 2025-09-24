import React, { useState } from "react";
import api from "../utils/api";

const categories = [
  { key: "mcq", label: "MCQ Question" },
  { key: "long", label: "Long Answer Question" },
  { key: "coding", label: "Coding Question" },
];

export default function CreateTest() {
  const [category, setCategory] = useState("");
  const [testName, setTestName] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({});
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // For coding
  const [language, setLanguage] = useState("javascript");

  // Add question
  const addQuestion = () => {
    if (category === "mcq" && (!currentQ.question || !currentQ.options || !currentQ.correctOption || !currentQ.marks)) return;
    if (category === "long" && (!currentQ.question || !currentQ.answer || !currentQ.marks)) return;
    if (category === "coding" && (!currentQ.question || !currentQ.answer || !currentQ.marks)) return;

    setQuestions([...questions, { ...currentQ, type: category, language }]);
    setCurrentQ({});
  };

  // AI generate
  const handleAIGenerate = async () => {
    setAiLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setTestName(`AI Test: ${aiTopic}`);
      setCategory("mcq");
      setDuration(10);
      setTotalMarks(10);
      setNumQuestions(2);
      setQuestions([
        {
          type: "mcq",
          question: `What is ${aiTopic}?`,
          options: ["A", "B", "C", "D"],
          correctOption: "A",
          marks: 5,
        },
        {
          type: "mcq",
          question: `Why use ${aiTopic}?`,
          options: ["Reason 1", "Reason 2", "Reason 3", "Reason 4"],
          correctOption: "Reason 1",
          marks: 5,
        },
      ]);
      setAiLoading(false);
    }, 2000);
  };

  // Submit test
  const handleSubmit = async () => {
    try {
      // Validate that we have all required data
      if (!testName || !duration || !totalMarks || questions.length === 0) {
        alert("Please fill all required fields and add at least one question.");
        return;
      }

      const response = await api.post("/tests", {
        name: testName,
        category: category || "mixed",
        type: category || "mixed", // Add type field
        duration: parseInt(duration),
        totalMarks: parseInt(totalMarks),
        questions,
      });
      
      console.log("Test created successfully:", response.data);
      alert("Test created successfully!");
      
      // Reset form
      setCategory("");
      setTestName("");
      setDuration("");
      setTotalMarks("");
      setNumQuestions("");
      setQuestions([]);
      setCurrentQ({});
      setAiTopic("");
    } catch (error) {
      console.error("Error creating test:", error);
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        if (status === 401) {
          alert("Authentication failed. Please login again.");
          // The API interceptor will handle redirect
        } else {
          alert(`Error creating test (${status}): ${message}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response from server:", error.request);
        alert("Failed to create test. No response from server. Please check your connection and ensure you're logged in.");
      } else {
        // Something else happened
        console.error("Request setup error:", error.message);
        alert(`Error creating test: ${error.message}`);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Create Test</h1>
      <div className="flex space-x-4 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`px-4 py-2 rounded-lg border ${category === cat.key ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => { setCategory(cat.key); setQuestions([]); setCurrentQ({}); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Test Name"
          value={testName}
          onChange={e => setTestName(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Duration (minutes)"
          type="number"
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Total Marks"
          type="number"
          value={totalMarks}
          onChange={e => setTotalMarks(e.target.value)}
        />
        {(category === "mcq" || category === "long") && (
          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Number of Questions"
            type="number"
            value={numQuestions}
            onChange={e => setNumQuestions(e.target.value)}
          />
        )}
      </div>

      {/* AI Generate */}
      <div className="mb-4">
        <input
          className="border p-2 rounded w-2/3"
          placeholder="Or enter topic for AI test generation"
          value={aiTopic}
          onChange={e => setAiTopic(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-green-600 text-white rounded"
          onClick={handleAIGenerate}
          disabled={aiLoading || !aiTopic}
        >
          {aiLoading ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      {/* Add Questions */}
      {category && (
        <div className="mb-4 border-t pt-4">
          <h2 className="font-semibold mb-2">Add Questions</h2>
          {category === "mcq" && (
            <>
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Question"
                value={currentQ.question || ""}
                onChange={e => setCurrentQ({ ...currentQ, question: e.target.value })}
              />
              {[0, 1, 2, 3].map(i => (
                <input
                  key={i}
                  className="border p-2 rounded w-full mb-2"
                  placeholder={`Option ${i + 1}`}
                  value={currentQ.options?.[i] || ""}
                  onChange={e => {
                    const opts = currentQ.options ? [...currentQ.options] : ["", "", "", ""];
                    opts[i] = e.target.value;
                    setCurrentQ({ ...currentQ, options: opts });
                  }}
                />
              ))}
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Correct Option"
                value={currentQ.correctOption || ""}
                onChange={e => setCurrentQ({ ...currentQ, correctOption: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Marks"
                type="number"
                value={currentQ.marks || ""}
                onChange={e => setCurrentQ({ ...currentQ, marks: e.target.value })}
              />
            </>
          )}
          {category === "long" && (
            <>
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Question"
                value={currentQ.question || ""}
                onChange={e => setCurrentQ({ ...currentQ, question: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Answer (for verification)"
                value={currentQ.answer || ""}
                onChange={e => setCurrentQ({ ...currentQ, answer: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Marks"
                type="number"
                value={currentQ.marks || ""}
                onChange={e => setCurrentQ({ ...currentQ, marks: e.target.value })}
              />
            </>
          )}
          {category === "coding" && (
            <>
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Question"
                value={currentQ.question || ""}
                onChange={e => setCurrentQ({ ...currentQ, question: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Expected Output (for verification)"
                value={currentQ.answer || ""}
                onChange={e => setCurrentQ({ ...currentQ, answer: e.target.value })}
              />
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Marks"
                type="number"
                value={currentQ.marks || ""}
                onChange={e => setCurrentQ({ ...currentQ, marks: e.target.value })}
              />
              <select
                className="border p-2 rounded w-full mb-2"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
            </>
          )}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addQuestion}
            disabled={
              (category === "mcq" && (!currentQ.question || !currentQ.options || !currentQ.correctOption || !currentQ.marks)) ||
              (category === "long" && (!currentQ.question || !currentQ.answer || !currentQ.marks)) ||
              (category === "coding" && (!currentQ.question || !currentQ.answer || !currentQ.marks))
            }
          >
            Add Question
          </button>
          <div className="mt-4">
            <strong>Questions Added: {questions.length}</strong>
          </div>
        </div>
      )}

      <button
        className="bg-green-600 text-white px-6 py-3 rounded-lg mt-4"
        onClick={handleSubmit}
        disabled={
          !testName ||
          !duration ||
          !totalMarks ||
          (category !== "coding" && questions.length !== Number(numQuestions)) ||
          (category === "coding" && questions.length === 0)
        }
      >
        Create Test
      </button>
    </div>
  );
}