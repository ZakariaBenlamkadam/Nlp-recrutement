import React, { useState } from 'react';

function App() {
  const [results, setResults] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resumes', e.target.resumes.files[0]);
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
    <div className="App">
      <h1>Resume Matching</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload Resumes CSV:</label>
          <input type="file" name="resumes" required />
        </div>
        <div>
          <label>Job Description:</label>
          <textarea
            name="job_description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows="10"
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>Results:</h2>
      {results.length > 0 && (
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              CV ID: {result.cv_id}, Similarity: {result.similarity_cosine}, Text: {result.cv_text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

