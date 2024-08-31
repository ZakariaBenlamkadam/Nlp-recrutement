import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-text">&copy; 2024 Resume Matcher. All rights reserved.</div>
      <nav className="footer-nav">
        <a href="#" className="nav-link">Privacy</a>
        <a href="#" className="nav-link">Terms</a>
        <a href="#" className="nav-link">Support</a>
      </nav>
    </footer>
  );
}

export default Footer;
