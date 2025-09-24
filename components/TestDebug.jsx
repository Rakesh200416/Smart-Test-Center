// Debug test for voice and submission issues
import React, { useState } from 'react';

const TestDebug = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  // Voice alert function with better error handling
  const speakViolation = (message) => {
    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        // Cancel any existing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.volume = 0.8;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.lang = 'en-US';
        
        // Add event listeners for debugging
        utterance.onstart = () => console.log('Speech started:', message);
        utterance.onerror = (event) => console.error('Speech error:', event.error);
        utterance.onend = () => console.log('Speech ended');
        
        window.speechSynthesis.speak(utterance);
        console.log('Speech synthesis called for:', message);
      } else {
        console.warn('Speech synthesis not supported');
        alert('Speech not supported - would have said: ' + message);
      }
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      alert('Speech error - would have said: ' + message);
    }
  };

  const testVoice = () => {
    const message = `Test voice alert. Violation ${violationCount + 1} of 3`;
    console.log('Testing voice with message:', message);
    speakViolation(message);
  };

  const testViolation = () => {
    if (isSubmitting) {
      console.log('Submission in progress, ignoring violation');
      return;
    }
    
    setViolationCount(prev => {
      const newCount = prev + 1;
      const message = `Copy paste detected - Warning ${newCount}`;
      
      console.log(`Violation ${newCount}/3:`, message);
      speakViolation(`Warning ${newCount} of 3: ${message}`);
      
      if (newCount >= 3) {
        console.log('Third violation reached, would auto-submit...');
        speakViolation("Three violations detected. Test would be submitted automatically.");
      } else {
        alert(`⚠️ Warning ${newCount}/3: ${message}`);
      }
      
      return newCount;
    });
  };

  const testSubmission = () => {
    if (isSubmitting) {
      console.log('Already submitting, ignoring...');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Starting submission...');
    
    setTimeout(() => {
      console.log('Submission completed');
      setIsSubmitting(false);
    }, 3000);
  };

  const resetTest = () => {
    setViolationCount(0);
    setIsSubmitting(false);
    console.log('Test reset');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Voice and Submission Debug Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Current State:</strong></p>
        <p>Violations: {violationCount}/3</p>
        <p>Submitting: {isSubmitting ? 'Yes' : 'No'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testVoice} style={{ margin: '5px', padding: '10px' }}>
          Test Voice Only
        </button>
        
        <button onClick={testViolation} style={{ margin: '5px', padding: '10px' }}>
          Trigger Violation
        </button>
        
        <button onClick={testSubmission} style={{ margin: '5px', padding: '10px' }}>
          Test Submission
        </button>
        
        <button onClick={resetTest} style={{ margin: '5px', padding: '10px' }}>
          Reset
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Instructions:</p>
        <ul>
          <li>Test Voice Only - Tests if speech synthesis works</li>
          <li>Trigger Violation - Simulates copy/paste violation</li>
          <li>Test Submission - Tests submission lock mechanism</li>
          <li>Reset - Resets all counters</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDebug;