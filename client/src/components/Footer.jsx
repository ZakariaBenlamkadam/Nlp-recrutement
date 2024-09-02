import React from 'react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
        <div className="footer-text">&copy; 2024 Team 3D. All rights reserved.</div>
        <nav className="footer-nav">
          <a href="#" className="nav-link">Privacy</a>
          <a href="#" className="nav-link">Terms</a>
          <a href="#" className="nav-link">Support</a>
        </nav>
      </footer>
  )
}
