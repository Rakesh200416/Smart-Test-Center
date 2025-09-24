import React, { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Clock, Award, Play, Filter } from 'lucide-react';

export default function PracticePage({ tests, onStartTest, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || test.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'MCQ': return 'blue';
      case 'Long': return 'emerald';
      case 'Coding': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Practice Tests</h1>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tests..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Types</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="Long">Long Answer</option>
                <option value="Coding">Coding</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => {
              const typeColor = getTypeColor(test.type);
              return (
                <div
                  key={test.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                  <div className={`h-2 bg-gradient-to-r from-${typeColor}-500 to-${typeColor}-600`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {test.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${typeColor}-100 text-${typeColor}-700`}>
                        {test.type}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                        {test.questions.length} Questions
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="h-4 w-4 mr-2 text-gray-400" />
                        {test.totalMarks} Total Marks
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {test.duration} Minutes
                      </div>
                    </div>

                    <button
                      onClick={() => onStartTest(test)}
                      className={`w-full px-4 py-3 bg-${typeColor}-600 text-white rounded-lg hover:bg-${typeColor}-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium group-hover:scale-105`}
                    >
                      <Play className="h-4 w-4" />
                      <span>Take Test</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'No tests have been created yet.'}
            </p>
            {!searchTerm && filterType === 'All' && (
              <button
                onClick={() => onBack()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Create First Test
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
