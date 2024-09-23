import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import {Link } from 'react-router-dom';
import './SignUp.css'


const SignUp = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate(); 

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !phone || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    } 

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('/register', { // Update with your API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          phone,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        navigate('/sign-in'); // Redirect to sign-in page
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch (error) {
      setError('An error occurred.');
    }
  };

  return (
    <>
    <div className="signup-header">
        <h2>Start Building Your Dream Team!</h2>
      </div>
    <div className="form-container">
    
      <h1>SIGN UP</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group3">
          <input
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group3">
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group3">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i
            onClick={togglePasswordVisibility}
            className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'} password-toggle`}
          />
        </div>

        <div className="form-group3">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <i
            onClick={toggleConfirmPasswordVisibility}
            className={`fa ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} password-toggle`}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-options">
              <div>
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Remember me</label>
              </div>

              <Link to="/forgot-password" className="forgot-password">
                Forgot your password?
              </Link>
            </div>

          <button className='button1' type="submit">SIGN UP</button>
      </form>

      <div className="link-container">
        <p>Already have an account? <Link to="/sign-in" className='forget-password'>Sign In</Link></p>
      </div>
    </div>
    </>
  );
};

export default SignUp;
