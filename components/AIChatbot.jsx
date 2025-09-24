import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { chatWithAI } from '../services/aiService';
import './AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState('welcome'); // welcome, collectInfo, chat
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleStartChat = () => {
    setStep('collectInfo');
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (userName && userEmail) {
      setStep('chat');
      // Add welcome message
      setMessages([
        {
          id: 1,
          text: `Hello ${userName}! I'm your AI assistant for Smart Test Center. How can I help you today? You can ask me anything about the website, tests, or your account.`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  };

  // Function to detect language and generate appropriate response
  const generateBotResponse = (userInput, userName) => {
    const lowerInput = userInput.toLowerCase();
    
    // Check for different languages
    const isHindi = /[\u0900-\u097F]/.test(userInput);
    const isKannada = /[\u0C80-\u0CFF]/.test(userInput);
    
    if (isHindi) {
      // Hindi responses
      if (lowerInput.includes('नमस्ते') || lowerInput.includes('हैलो')) {
        return `नमस्ते ${userName}! मैं स्मार्ट टेस्ट सेंटर के लिए आपका एआई सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?`;
      } else if (lowerInput.includes('टेस्ट') && lowerInput.includes('बनाना')) {
        return "टेस्ट बनाने के लिए, मेंटर के रूप में लॉग इन करें और अपने डैशबोर्ड पर जाएँ। 'टेस्ट बनाएँ' पर क्लिक करें और प्रश्न जोड़ने के लिए विज़ार्ड का पालन करें। आप एमसीक्यू, लॉन्ग आंसर या कोडिंग प्रश्न बना सकते हैं।";
      } else if (lowerInput.includes('टेस्ट') && lowerInput.includes('देना')) {
        return "टेस्ट देने के लिए, छात्र के रूप में लॉग इन करें और 'माइ टेस्ट' पर जाएँ। एक टेस्ट चुनें और 'टेस्ट शुरू करें' पर क्लिक करें। कैमरा एक्सेस की अनुमति देना सुनिश्चित करें क्योंकि यह निगरानी के लिए आवश्यक है।";
      } else {
        return `मैं आपकी स्मार्ट टेस्ट सेंटर से संबंधित प्रश्नों का उत्तर दे सकता हूँ ${userName}। क्या आपके पास कोई विशिष्ट प्रश्न है?`;
      }
    } else if (isKannada) {
      // Kannada responses
      if (lowerInput.includes('ಹಲೋ') || lowerInput.includes('ನಮಸ್ಕಾರ')) {
        return `ಹಲೋ ${userName}! ನಾನು ಸ್ಮಾರ್ಟ್ ಟೆಸ್ಟ್ ಸೆಂಟರ್‌ಗಾಗಿ ನಿಮ್ಮ ಎಐ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`;
      } else if (lowerInput.includes('ಪರೀಕ್ಷೆ') && lowerInput.includes('ರಚಿಸಿ')) {
        return "ಪರೀಕ್ಷೆಯನ್ನು ರಚಿಸಲು, ಮೆಂಟರ್ ಆಗಿ ಲಾಗ್ ಇನ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ. 'ಪರೀಕ್ಷೆಯನ್ನು ರಚಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ಪ್ರಶ್ನೆಗಳನ್ನು ಸೇರಿಸಲು ವಿಜಾರ್ಡ್ ಅನ್ನು ಅನುಸರಿಸಿ. ನೀವು MCQ, ದೀರ್ಘ ಉತ್ತರ ಅಥವಾ ಕೋಡಿಂಗ್ ಪ್ರಶ್ನೆಗಳನ್ನು ರಚಿಸಬಹುದು.";
      } else if (lowerInput.includes('ಪರೀಕ್ಷೆ') && lowerInput.includes('ತೆಗೆದುಕೊಳ್ಳಿ')) {
        return "ಪರೀಕ್ಷೆಯನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು, ವಿದ್ಯಾರ್ಥಿಯಾಗಿ ಲಾಗ್ ಇನ್ ಮಾಡಿ ಮತ್ತು 'ನನ್ನ ಪರೀಕ್ಷೆಗಳು' ಗೆ ಹೋಗಿ. ಪರೀಕ್ಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು 'ಪರೀಕ್ಷೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ. ಮೇಲ್ವಿಚಾರಣೆಗಾಗಿ ಕ್ಯಾಮರಾ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.";
      } else {
        return `ನಾನು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಟೆಸ್ಟ್ ಸೆಂಟರ್ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಬಲ್ಲೆ ${userName}। ನಿಮಗೆ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ ಇದೆಯೇ?`;
      }
    } else {
      // English responses
      if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        return `Hello ${userName}! I'm your AI assistant for Smart Test Center. How can I help you today?`;
      } else if (lowerInput.includes('test') && lowerInput.includes('create')) {
        return "To create a test, log in as a mentor and go to your dashboard. Click on 'Create Test' and follow the wizard to add questions. You can create MCQ, Long Answer, or Coding questions.";
      } else if (lowerInput.includes('test') && lowerInput.includes('take')) {
        return "To take a test, log in as a student and go to 'My Tests'. Select a test and click 'Start Test'. Make sure to allow camera access as it's required for monitoring.";
      } else if (lowerInput.includes('account') || lowerInput.includes('profile')) {
        return "You can update your profile by going to your dashboard and clicking 'Edit Profile'. You can change your name, contact information, and upload an avatar.";
      } else if (lowerInput.includes('score') || lowerInput.includes('result')) {
        return "To view your test scores, log in as a student and go to 'My Scores' in your dashboard. You'll see a list of all your completed tests with scores and details.";
      } else if (lowerInput.includes('mentor')) {
        return "Mentors can create tests, view student submissions, and monitor test results. Log in with your mentor account to access these features.";
      } else if (lowerInput.includes('student')) {
        return "Students can take tests, view their scores, and track their progress. Make sure to complete your profile to get the best experience.";
      } else if (lowerInput.includes('admin')) {
        return "Admins manage the entire system, including user accounts and overall statistics. Only authorized personnel should have admin access.";
      } else if (lowerInput.includes('help')) {
        return "I can help you with:\n• Creating and taking tests\n• Managing your account\n• Understanding different user roles\n• Navigating the dashboard\n\nWhat specific topic would you like to know more about?";
      } else if (lowerInput.includes('thank')) {
        return "You're welcome! Is there anything else I can help you with?";
      } else {
        // Default responses
        const responses = [
          `I understand you're asking about: "${userInput}". For specific questions about Smart Test Center, I recommend checking the Help section or contacting support.`,
          `Thanks for your question! For detailed information about "${userInput}", please refer to our documentation or user guides.`,
          `I'm here to help with Smart Test Center related questions. Could you please rephrase your question or ask about a specific feature?`,
          `For queries about "${userInput}", I suggest exploring the relevant section in your dashboard or reaching out to our support team.`
        ];
        
        // Return a random response
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the AI service
      const botResponse = await chatWithAI(inputValue, userName, userEmail);
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    } catch (error) {
      // Fallback to mock responses if API fails
      const fallbackResponse = generateBotResponse(inputValue, userName);
      const botMessage = {
        id: messages.length + 2,
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className="ai-chatbot-toggle"
        onClick={toggleChat}
        aria-label="Open AI Chatbot"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chatbot Popup */}
      {isOpen && (
        <div className="ai-chatbot-popup">
          <div className="ai-chatbot-header">
            <div className="ai-chatbot-header-info">
              <MessageCircle size={20} />
              <h3>STC AI Assistant</h3>
            </div>
            <button 
              className="ai-chatbot-close" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="ai-chatbot-messages">
            {step === 'welcome' && (
              <div className="ai-chatbot-welcome">
                <div className="ai-chatbot-bot-icon">
                  <Bot size={32} />
                </div>
                <h2>Welcome to STC AI Assistant!</h2>
                <p>I can help you with questions about Smart Test Center. How can I assist you today?</p>
                <button 
                  className="ai-chatbot-start-btn"
                  onClick={handleStartChat}
                >
                  Start Chat
                </button>
              </div>
            )}

            {step === 'collectInfo' && (
              <div className="ai-chatbot-info-form">
                <div className="ai-chatbot-bot-icon">
                  <Bot size={32} />
                </div>
                <h2>Let's get started!</h2>
                <p>Please provide your name and email to continue:</p>
                <form onSubmit={handleInfoSubmit}>
                  <div className="ai-chatbot-form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="ai-chatbot-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button type="submit" className="ai-chatbot-submit-btn">
                    Continue
                  </button>
                </form>
              </div>
            )}

            {step === 'chat' && (
              <>
                <div className="ai-chatbot-messages-container">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`ai-chatbot-message ${message.sender}`}
                    >
                      <div className="ai-chatbot-message-sender">
                        {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className="ai-chatbot-message-content">
                        <div className="ai-chatbot-message-text">
                          {message.text.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        <div className="ai-chatbot-message-time">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="ai-chatbot-message bot">
                      <div className="ai-chatbot-message-sender">
                        <Bot size={16} />
                      </div>
                      <div className="ai-chatbot-message-content">
                        <div className="ai-chatbot-typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="ai-chatbot-input-form" onSubmit={handleSendMessage}>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    rows="1"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;