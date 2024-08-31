import React, { useState } from 'react';
import axios from 'axios';
import './Results.css'
const Results1 = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResumeChange = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!resumeFile || !jobDescription) {
      alert('Please provide both the resume file and job description.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resumes', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="resumeFile">Upload Resume:</label>
          <input
            type="file"
            id="resumeFile"
            name="resumes"
            accept=".csv"
            onChange={handleResumeChange}
          />
        </div>
        <div>
          <label htmlFor="jobDescription">Job Description:</label>
          <textarea
            id="jobDescription"
            name="job_description"
            value={jobDescription}
            onChange={handleJobDescriptionChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {error && <p>Error: {error}</p>}
      {results && results.length > 0 ? (
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              Job Index: {result.job_idx}, CV ID: {result.cv_id}, Similarity: {result.similarity_cosine}
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default Results1;
