import React from 'react';
import { Users, Award, BookOpen, Code } from 'lucide-react';
import '../styles.css';

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Nayana S S",
      role: "Developer",
      description: "Student of ISE SIET currently working on SMART TEST CENTER"
    },
    {
      name: "Rakesh R",
      role: "Developer",
      description: "Student of ISE SIET currently working on SMART TEST CENTER"
    },
    {
      name: "Ranjitha A M",
      role: "Developer",
      description: "Student of ISE SIET currently working on SMART TEST CENTER"
    },
    {
      name: "Vasu M S",
      role: "Developer",
      description: "Student of ISE SIET currently working on SMART TEST CENTER"
    }
  ];

  const features = [
    {
      icon: <BookOpen className="w-12 h-12 text-blue-600" />,
      title: "Comprehensive Testing",
      description: "Multiple test formats including MCQs, coding challenges, and descriptive questions."
    },
    {
      icon: <Code className="w-12 h-12 text-green-600" />,
      title: "Coding Assessments",
      description: "Advanced coding evaluation with support for multiple programming languages."
    },
    {
      icon: <Award className="w-12 h-12 text-purple-600" />,
      title: "Real-time Results",
      description: "Instant scoring and detailed analytics for performance tracking."
    },
    {
      icon: <Users className="w-12 h-12 text-orange-600" />,
      title: "User-friendly Interface",
      description: "Intuitive design for seamless navigation and test-taking experience."
    }
  ];

  return (
    <div className="about-us-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">About Smart Test Center</h1>
            <p className="about-hero-subtitle">
              Revolutionizing online assessments with cutting-edge technology and user-centric design
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content">
        <div className="container">
          <div className="about-main">
            <div className="about-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="about-paragraph">
                Smart Test Center is an innovative online examination platform designed to provide secure, 
                reliable, and comprehensive testing solutions for educational institutions and organizations. 
                Our platform offers a seamless experience for creating, administering, and evaluating tests 
                across various domains and difficulty levels.
              </p>
              
              <h2 className="section-title">Our Vision</h2>
              <p className="about-paragraph">
                We envision a future where assessments are accessible, fair, and efficient for everyone. 
                By leveraging advanced technology and thoughtful design, we aim to transform the way 
                educational assessments are conducted, making them more engaging and insightful for 
                both educators and students.
              </p>
              
              <h2 className="section-title">Why Choose Us</h2>
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
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle">
              The passionate students behind Smart Test Center
            </p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card">
                <div className="team-member-content">
                  <div className="team-member-avatar">
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="team-member-name">{member.name}</h3>
                  <p className="team-member-role">{member.role}</p>
                  <p className="team-member-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Assessments?</h2>
            <p className="cta-subtitle">
              Join thousands of educators and students using Smart Test Center
            </p>
            <div className="cta-buttons">
              <a href="/signup" className="btn-primary">Get Started</a>
              <a href="/contactus" className="btn-secondary">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}