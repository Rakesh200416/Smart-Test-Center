import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  Shield, 
  Clock, 
  Award, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Code,
  Brain,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const slides = [
    {
      title: "Advanced Online Testing Platform",
      subtitle: "Experience seamless exam management with our cutting-edge technology",
      image: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      title: "Secure & Reliable Examinations",
      subtitle: "Built-in security features ensure fair and trustworthy testing",
      image: "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      title: "Real-Time Results & Analytics",
      subtitle: "Get instant feedback and detailed performance insights",
      image: "https://images.pexels.com/photos/5676744/pexels-photo-5676744.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      title: "Flexible Test Formats",
      subtitle: "Multiple choice, coding challenges, and custom question types",
      image: "https://images.pexels.com/photos/4050287/pexels-photo-4050287.jpeg?auto=compress&cs=tinysrgb&w=1200"
    }
  ];

  const tests = [
    {
      title: "Aptitude Test",
      description: "Comprehensive aptitude assessment covering logical reasoning, quantitative ability, and verbal skills.",
      duration: "60 mins",
      questions: "50 Questions",
      icon: <Brain className="w-8 h-8" />
    },
    {
      title: "Coding Challenge",
      description: "Programming test with algorithm challenges and data structure problems.",
      duration: "90 mins",
      questions: "5 Problems",
      icon: <Code className="w-8 h-8" />
    },
    {
      title: "General Knowledge",
      description: "Current affairs, history, geography, and general awareness test.",
      duration: "45 mins",
      questions: "40 Questions",
      icon: <Globe className="w-8 h-8" />
    },
    {
      title: "English Proficiency",
      description: "Grammar, vocabulary, comprehension, and written communication skills assessment.",
      duration: "50 mins",
      questions: "35 Questions",
      icon: <BookOpen className="w-8 h-8" />
    }
  ];

  const feedback = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Excellent platform! The interface is user-friendly and the test experience was smooth. Highly recommend for online assessments.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Michael Chen",
      rating: 5,
      comment: "Great variety of tests and instant results. The coding challenges were particularly well-designed and challenging.",
      avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Emily Davis",
      rating: 4,
      comment: "Professional exam environment with secure testing. The real-time monitoring gives confidence in the results.",
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "David Rodriguez",
      rating: 5,
      comment: "Best online testing platform I've used. Clean interface, reliable performance, and comprehensive test analytics.",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Secure Exams",
      description: "Advanced security measures including browser lockdown, screen recording detection, and AI-powered proctoring."
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Real-Time Results",
      description: "Instant scoring and detailed analytics with performance insights and improvement recommendations."
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: "Flexible Scheduling",
      description: "Take tests anytime, anywhere with our responsive platform that works on all devices."
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "24/7 Support",
      description: "Round-the-clock technical support and assistance for seamless testing experience."
    }
  ];

  // Navigation functions
  const handleJoinNow = () => {
    navigate('/signup');
  };

  const handleTakeTest = () => {
    if (user) {
      navigate('/my-tests');
    } else {
      navigate('/login');
    }
  };

  const handleTakeNow = (test) => {
    if (user) {
      navigate('/my-tests');
    } else {
      navigate('/signup');
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="hero-highlight">Smart Test Center</span>
            </h1>
            <p className="hero-subtitle">
              Your trusted online exam partner for secure, reliable, and comprehensive testing solutions
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleJoinNow}>Join Now</button>
              <button className="btn-secondary" onClick={handleTakeTest}>Take Test</button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Slider Section */}
      <section className="slider-section">
        <div className="container">
          <div className="slider-container">
            <div 
              className="slider-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="slide">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="slide-image"
                  />
                  <div className="slide-overlay">
                    <div className="slide-content">
                      <h2 className="slide-title">{slide.title}</h2>
                      <p className="slide-subtitle">{slide.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button onClick={prevSlide} className="nav-arrow nav-arrow-left">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="nav-arrow nav-arrow-right">
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="dots-container">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`dot ${index === currentSlide ? 'dot-active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Available Tests Section */}
      <section className="tests-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Available Tests</h2>
            <p className="section-subtitle">
              Choose from our comprehensive collection of professionally designed assessments
            </p>
          </div>
          
          <div className="tests-grid">
            {tests.map((test, index) => (
              <div key={index} className="test-card">
                <div className="test-card-content">
                  <div className="test-icon">
                    {test.icon}
                  </div>
                  <h3 className="test-title">{test.title}</h3>
                  <p className="test-description">{test.description}</p>
                  <div className="test-meta">
                    <span className="test-meta-item">
                      <Clock className="w-4 h-4" />
                      {test.duration}
                    </span>
                    <span className="test-meta-item">
                      <BookOpen className="w-4 h-4" />
                      {test.questions}
                    </span>
                  </div>
                  <button className="test-btn" onClick={() => handleTakeNow(test)}>Take Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Feedback Section */}
      <section className="feedback-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">
              Trusted by thousands of students and professionals worldwide
            </p>
          </div>
          
          <div className="feedback-grid">
            {feedback.map((review, index) => (
              <div key={index} className="feedback-card">
                <div className="feedback-header">
                  <img 
                    src={review.avatar} 
                    alt={review.name}
                    className="feedback-avatar"
                  />
                  <div className="feedback-user">
                    <h4 className="feedback-name">{review.name}</h4>
                    <div className="feedback-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="feedback-comment">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Smart Test Center?</h2>
            <p className="section-subtitle">
              We provide enterprise-grade testing solutions with unmatched reliability and user experience
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <h3 className="footer-brand">Smart Test Center</h3>
              <p className="footer-description">
                Leading online examination platform providing secure, reliable, and comprehensive testing solutions for educational institutions and corporations.
              </p>
            </div>
            <div className="footer-links">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-list">
                <li><a href="/aboutus" className="footer-link">About Us</a></li>
                <li><a href="/contactus" className="footer-link">Contact Us</a></li>
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                <li><a href="#" className="footer-link">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">Help Center</a></li>
                <li><a href="#" className="footer-link">Documentation</a></li>
                <li><a href="#" className="footer-link">FAQ</a></li>
                <li><a href="#" className="footer-link">Live Chat</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-copyright">© 2025 Smart Test Center. All rights reserved.</p>
              <div className="footer-bottom-links">
                <a href="/aboutus" className="footer-link">About Us</a>
                <a href="/contactus" className="footer-link">Contact Us</a>
                <a href="#" className="footer-link">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;