import React, { useEffect, useState } from "react";
import { Search, Filter, BookOpen, Clock, Target } from "lucide-react";
import api from "../utils/api";
import TestCard from "../components/TestCard";
import { useNavigate } from "react-router-dom";
import "./mytests.css";

export default function MyTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/tests");
        console.log("API Response:", res.data);
        
        // The API now returns a direct array with questionCount included
        const testsData = Array.isArray(res.data) ? res.data : [];
        
        setTests(testsData);
      } catch (err) {
        console.error("Error fetching tests:", err);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTests();
  }, []);

  const handleTakeTest = (test) => {
    navigate(`/take-test/${test._id}`, { state: { test } });
  };

  // Filter tests based on search and category
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = selectedCategory === "all" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(tests.map(test => test.category).filter(Boolean))];

  // Calculate stats
  const totalTests = tests.length;
  const totalQuestions = tests.reduce((sum, test) => sum + (test.questionCount || test.questions?.length || 0), 0);
  const totalMarks = tests.reduce((sum, test) => sum + (test.totalMarks || 0), 0);
  const avgDuration = totalTests > 0 ? Math.round(tests.reduce((sum, test) => sum + (test.duration || 0), 0) / totalTests) : 0;

  if (loading) {
    return (
      <div className="mytests-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mytests-container">
      {/* Header Section */}
      <div className="mytests-header">
        <div className="header-content">
          <h1 className="page-title">Available Tests</h1>
          <p className="page-subtitle">Choose a test to begin your assessment</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{totalTests}</h3>
            <p className="stat-label">Total Tests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon bg-green-100">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{totalQuestions}</h3>
            <p className="stat-label">Questions</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{totalMarks}</h3>
            <p className="stat-label">Total Marks</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon bg-orange-100">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{avgDuration}</h3>
            <p className="stat-label">Avg Duration (min)</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <Filter className="filter-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <div className="no-tests-container">
          <BookOpen className="no-tests-icon" />
          <h3 className="no-tests-title">
            {searchTerm || selectedCategory !== "all" ? "No tests match your criteria" : "No tests available"}
          </h3>
          <p className="no-tests-subtitle">
            {searchTerm || selectedCategory !== "all" 
              ? "Try adjusting your search or filter settings" 
              : "Tests will appear here once they are created"
            }
          </p>
        </div>
      ) : (
        <div className="tests-grid">
          {filteredTests.map(test => (
            <TestCard 
              key={test._id} 
              test={test} 
              onTakeTest={handleTakeTest} 
            />
          ))}
        </div>
      )}
    </div>
  );
}