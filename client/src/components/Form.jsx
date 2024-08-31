import React from 'react';
import './Form.css';

function Form() {
  return (
    <div className="form-container">
      <h1 className="form-title">Find the Perfect Candidate</h1>
      <form className="form-content">
        <div className="form-group">
          <div className="form-item">
            <label htmlFor="resume">Upload Resume</label>
            <input id="resume" type="file" accept=".csv" className="form-input-file" />
          </div>
          <div className="form-item">
            <label htmlFor="job-description">Job Description</label>
            <textarea id="job-description" rows="3" placeholder="Enter job description" className="form-input-textarea" />
          </div>
        </div>
        <button type="submit" className="form-button">Match Resumes</button>
      </form>
    </div>
  );
}

export default Form;

