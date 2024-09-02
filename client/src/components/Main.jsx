import React, {useState} from 'react'
import './Main.css'
export default function Main() {
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
    <div>
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
    </div>
  )
}
