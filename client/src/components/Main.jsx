import React, { useState, useRef } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Main.css';

export default function Main() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({});
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false); 

  const toast = useRef(null);

  const onUpload = () => {
    toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resumeFile || !jobDescription) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setIsLoading(true); // Start loading animation

    const formData = new FormData();
    formData.append('resumes', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResults(data);
      setResultsLoaded(true);
      setIsLoading(false); 
      setError('');
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError('There was an error processing your request. Please try again.');
      setIsLoading(false); 
    }
  };

  const handleGenerateQuestions = async (resumeText) => {
    setSelectedResume(resumeText);
    setIsLoadingQuestions(true);
    try {
      const response = await fetch('http://localhost:5000/generate-questions', {
        method: 'POST',
        body: JSON.stringify({ results: [{ cv_text: resumeText }] }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const questionsData = await response.json();
      setQuestions(questionsData);
      setShowModal(true);
      setIsLoadingQuestions(false);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setIsLoadingQuestions(false);
    }
  };
  const handleGenerateFeedback = async (question) => {
    if (!userAnswers[question.text]) return; // Check if an answer exists

    try {
      const response = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        body: JSON.stringify({ question_text: question.text, user_answer: userAnswers[question.text] }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const feedbackData = await response.json();
      setFeedback({
        ...feedback,
        [question.text]: feedbackData, // Store feedback for this question
      });

      // Determine the feedback message based on the indicator score
      let message = "";
      if (feedbackData.indicator >= 0 && feedbackData.indicator <= 4) {
        message = "Decrease the difficulty level if possible.";
      } else if (feedbackData.indicator >= 5 && feedbackData.indicator <= 6) {
        message = "Keep the difficulty level the same.";
      } else if (feedbackData.indicator >= 7 && feedbackData.indicator <= 10) {
        message = "Increase the difficulty level if possible.";
      }
      setFeedbackMessage({
        ...feedbackMessage,
        [question.text]: message, // Store message for this question
      });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };



  const closeModal = () => {
    setShowModal(false);
    setQuestions([]);
    setFeedback({});
    setFeedbackMessage({});
  };

  return (
    <div>
      <main>
        <div className={`form-container1 ${resultsLoaded ? 'results-loaded' : ''}`}>
          <h1 className="main-title">Find the Perfect Candidate</h1>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resume" className="label">Upload Resume</label>
              <FileUpload
                mode="basic"
                name="demo[]"
                url="/api/upload"
                accept=".csv"
                maxFileSize={1000000}
                onUpload={onUpload}
                onSelect={(e) => setResumeFile(e.files[0])}
                className="custom-fileupload"
              />
            </div>
            <div className="form-group1">
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

        {/* Loading animation */}
        {isLoading && (
          <div className="loading-container">
          <video autoPlay loop muted className="loading-video">
            <source src="video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          </div>
        )}

        <div className="results-container1">
          <div className="card3s">
            {results.map((result, index) => (
              <div className="card3" key={index}>
                <div className="card3-header">
                  <div className="card3-title">CV {result.cv_id}</div>
                  <div className="card3-percentage">{(result.similarity_cosine * 100).toFixed(2)}%</div>
                </div>
                <div className="card3-progress">
                  <div
                    className="card3-progress-bar"
                    style={{ width: `${(result.similarity_cosine * 100).toFixed(2)}%` }}
                  />
                </div>
                <button
                  className="generate-questions-button"
                  onClick={() => handleGenerateQuestions(result.cv_text)}
                >
                  Generate Questions
                </button>
              </div>
            ))}
          </div>
        </div>
        {isLoadingQuestions && (
          <div className="loading-container">
            <video autoPlay loop muted className="loading-video">
              <source src="video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Generated Questions</h2>
              <button className="close-modal-button" onClick={closeModal}>x</button>
              <div className="questions">
                {questions.map((question, index) => (
                  <div className="question-card3" key={index}>
                    <div className="question-text">{question.text}</div>
                    <div className="question-difficulty">{question.difficulty}</div>
                    <div className="question-category">{question.category}</div>
                    <input
                      className='input-text'
                      type="text"
                      placeholder="Your answer"
                      value={userAnswers[question.text] || ''}
                      onChange={(e) => {
                        setUserAnswers({
                          ...userAnswers,
                          [question.text]: e.target.value,
                        });
                      }}
                    />
                    <button
                      className="submit-feedback-button"
                      onClick={() => handleGenerateFeedback(question)}
                    >
                      Submit Answer
                    </button>
                    {/* Render feedback only if it exists for this question */}
                    {feedback[question.text] && (
                      <div className="feedback-section">
                        <div className="feedback-text">{feedback[question.text].feedback}</div>
                        <div className="feedback-indicator">Indicator: {feedback[question.text].indicator}</div>
                        <div className="difficulty-advice">{feedbackMessage[question.text]}</div>
                      </div>
                    )}
                  </div>
                  
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
