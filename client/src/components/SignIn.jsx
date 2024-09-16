import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';  // Import necessary hooks
import axios from 'axios';  // Import axios for making HTTP requests
import './SignIn.css';
import eyeOpenIcon from './assets/eyeopen.png';  // Import eye open icon
import eyeClosedIcon from './assets/eyeclosed.png';  // Import eye closed icon
import emailIcon from './assets/mail.png'

export default function SignIn({ setIsAuthenticated }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Use navigate for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);  // Update authentication state
        navigate(response.data.redirect);  // Navigate to the appropriate page
      } else {
        window.alert(response.data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      window.alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>The Search for Talent Begins Here!</h2>
      </div>

      <div className="login-form-container">
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group2">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <img
                    src= {emailIcon}
                    alt='email'
                    className="icon mail-icon"
                  />
              </div>
            </div>

            <div className="form-group2">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? eyeClosedIcon : eyeOpenIcon}
                    alt={showPassword ? 'Hide Password' : 'Show Password'}
                    className="password-toggle-icon"
                  />
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-options">
              <div>
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Remember me</label>
              </div>

              <Link to="/forgot-password" className="forgot-password">
                Forgot your password?
              </Link>
            </div>

            <button type="submit" className="login-button">LOGIN</button>
          </form>

          <div className="sign-up-option">
            <p>Don't have an account?</p>
            <Link to="/sign-up" className="signup-text">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
