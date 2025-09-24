import React from 'react';
import { Mail, Phone, MapPin, Clock, User, MessageCircle } from 'lucide-react';
import '../styles.css';

export default function ContactUs() {
  const handleEmailClick = () => {
    window.location.href = 'mailto:quearys@smarttestcenter.org';
  };

  return (
    <div className="contact-us-container">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">Contact Us</h1>
            <p className="contact-hero-subtitle">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="contact-info">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">
              Have questions or feedback? We're here to help.
            </p>
          </div>
          
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="contact-card-title">Email Us</h3>
              <p className="contact-card-text">quearys@smarttestcenter.org</p>
              <button className="contact-btn" onClick={handleEmailClick}>
                Send Email
              </button>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="contact-card-title">Call Us</h3>
              <p className="contact-card-text">+91 8574965478  +12 521478</p>
              <p className="contact-card-text">Mon-Fri, 9:00 AM - 6:00 PM</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="contact-card-title">Visit Us</h3>
              <p className="contact-card-text">HSR layout 1st steet </p>
              <p className="contact-card-text">Bangalore, Karnataka 560001</p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="contact-card-title">Support Hours</h3>
              <p className="contact-card-text">Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p className="contact-card-text">Saturday: 10:00 AM - 4:00 PM</p>
              <p className="contact-card-text">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Query Section */}
      <section className="query-section">
        <div className="container">
          <div className="query-content">
            <div className="query-icon">
              <MessageCircle className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="query-title">Have Any Queries?</h2>
            <p className="query-description">
              Feel free to connect with us for any questions, suggestions, or support requests. 
              Our team is dedicated to providing you with the best experience possible. 
              Whether you're an educator looking to create assessments, a student taking tests, 
              or just curious about our platform, we're here to assist you.
            </p>
            <button className="query-btn" onClick={handleEmailClick}>
              Send Message
            </button>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="additional-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="info-title">Customer Support</h3>
              <p className="info-text">
                Our support team is ready to assist you with any technical issues or questions 
                about using our platform.
              </p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="info-title">Feedback & Suggestions</h3>
              <p className="info-text">
                We value your feedback and are constantly working to improve our platform. 
                Share your suggestions with us!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}