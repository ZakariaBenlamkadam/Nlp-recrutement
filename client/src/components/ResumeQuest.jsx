import React, { useState } from 'react';
import './ResumeQuest.css';

function ResumeQuest() {
  const [resumeText, setResumeText] = useState('');
  const [skills, setSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');

  const handleExtractSkills = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume_text: resumeText }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Extracted data:', data); // Debugging log
      setSkills(data.skills || []);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error extracting skills or generating questions:', error);
    }
  };

  const handleGenerateQuestions = async (skill) => {
    try {
      const response = await fetch('http://localhost:5000/api/generate_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: 'Data Science', skill: skill }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Generated questions:', data); // Debugging log
      setQuestions(data.questions || []);
      setSelectedSkill(skill);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  return (
    <div className="resumequest-container">
      <div className="resumequest-input-section">
        <label htmlFor="resume-text" className="resumequest-label">Paste your Resume</label>
        <textarea
          id="resume-text"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume here..."
          rows={6}
          className="resumequest-textarea"
        />
      </div>
      <button className="resumequest-extract-button" onClick={handleExtractSkills}>
        Extract Skills
      </button>

      <div className="resumequest-skills-section">
        <h2 className="resumequest-title">Extracted Skills</h2>
        {skills.length === 0 ? (
          <p>No skills extracted yet.</p>
        ) : (
          <ul className="resumequest-skills-list">
            {skills.map((skill, index) => (
              <li key={index} className="resumequest-skill-item">
                {skill} 
                <button className="resumequest-generate-button" onClick={() => handleGenerateQuestions(skill)}>
                  Generate Questions
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="resumequest-questions-section">
        {questions.length > 0 && (
          <>
            <h2 className="resumequest-title">Interview Questions for {selectedSkill}</h2>
            <ul className="resumequest-questions-list">
              {questions.map((question, index) => (
                <li key={index} className="resumequest-question-item">
                  <strong>Question:</strong> {question.text || 'N/A'} <br />
                  <strong>Difficulty:</strong> {question.difficulty || 'N/A'} <br />
                  <strong>Category:</strong> {question.category || 'N/A'}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default ResumeQuest;
