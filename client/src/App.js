import React, { useState } from 'react';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const handleFileChange = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resumeFile || !jobDescription) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    const formData = new FormData();
    formData.append('resumes', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResults(data);
      setError('');
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError('There was an error processing your request. Please try again.');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="title">Resume Matcher</div>
        <nav className="nav">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Contact</a>
          <button className="menu-icon" aria-label="Menu">
            <MenuIcon />
          </button>
        </nav>
      </header>
      <main className="main">
        <div className="form-container">
          <h1 className="main-title">Find the Perfect Candidate</h1>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resume" className="label">Upload Resume</label>
              <input
                id="resume"
                type="file"
                accept=".csv"
                className="file-input"
                onChange={handleFileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="job-description" className="label">Job Description</label>
              <textarea
                id="job-description"
                rows="3"
                placeholder="Enter job description"
                className="textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="submit-button">Match Resumes</button>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
        <div className="results-container">
          <h2 className="results-title">Results</h2>
          <div className="cards">
            {results.map((result, index) => (
              <div className="card" key={index}>
                <div className="card-header">
                  <div className="card-title">CV {result.cv_id}</div>
                  <div className="card-percentage">{(result.similarity_cosine * 100).toFixed(2)}%</div>
                </div>
                <div className="card-progress">
                  <div
                    className="card-progress-bar"
                    style={{ width: `${(result.similarity_cosine * 100).toFixed(2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="footer-text">&copy; 2024 Resume Matcher. All rights reserved.</div>
        <nav className="footer-nav">
          <a href="#" className="nav-link">Privacy</a>
          <a href="#" className="nav-link">Terms</a>
          <a href="#" className="nav-link">Support</a>
        </nav>
      </footer>
    </div>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export default App;
