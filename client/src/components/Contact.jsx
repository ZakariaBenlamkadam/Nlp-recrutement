import React from 'react';
import './ContactPage.css';

export default function Contact() {
  return (
    <div className="contact-page">
      {/* Header */}
      <header className="header3">
        <div className="header-content">
          <h1>Contact Us</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content1">
        <div className="contact-container">
          <div className="contact-form-container">
            {/* Contact Form */}
            <div className="contact-card">
              <h2>Send us a message</h2>
              <form className="contact-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input id="fullName" name="fullName" type="text" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" name="email" type="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input id="subject" name="subject" type="text" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={4} required />
                </div>
                <div>
                  <button type="submit" className="btn-submit">Send Message</button>
                </div>
              </form>
            </div>
          </div>

          {/* Location and Office Information */}
          <div className="contact-info">
            <div className="info-card">
              <h2>Contact Information</h2>
              <div className="info-item">
                <span>📍 123 Recruitment Street, City, Country 12345</span>
              </div>
              <div className="info-item">
                <span>📞 +1 (123) 456-7890</span>
              </div>
              <div className="info-item">
                <span>✉️ info@recruitmentplatform.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="social-media">
          <h3>Connect with us</h3>
          <div className="social-icons">
            <a href="#">Facebook</a>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </main>

    </div>
  );
}
