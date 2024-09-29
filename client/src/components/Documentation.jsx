import React, { useState } from 'react';
import './Documentation.css';

const InstructionCard = ({ title, description, steps, icon }) => (
  <div className="card1">
    <div className="card1-header">
      <div className="card1-title">
        {icon && <span className="card1-icon">{icon}</span>}
        {title}
      </div>
      <div className="card1-description">{description}</div>
    </div>
    <div className="card1-content">
      <ol>
        {steps.map((step, index) => (
          <li key={index}>
            <span className="chevron">›</span> {step}
          </li>
        ))}
      </ol>
    </div>
  </div>
);

export default function Documentation() {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState('job-description');

  // Function to handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <header className="header2">
        <h1>Interview Question Generator Docs</h1>
      </header>

      <div className="content">
        <main className="main">
          <div className="tabs">
            <div className="tabs-list">
              <button
                onClick={() => handleTabClick('job-description')}
                className={activeTab === 'job-description' ? 'active' : ''}
              >
                Job Description
              </button>
              <button
                onClick={() => handleTabClick('resume')}
                className={activeTab === 'resume' ? 'active' : ''}
              >
                Resume
              </button>
              <button
                onClick={() => handleTabClick('matching')}
                className={activeTab === 'matching' ? 'active' : ''}
              >
                Matching
              </button>
            </div>
            <div className="tabs-content">
              {activeTab === 'job-description' && (
                <InstructionCard
                  title="Job Description-Based Question Generation"
                  description="Generate interview questions based on a job description."
                  steps={[
                    "Navigate to the Job Description page.",
                    "Enter the job description in the text area.",
                    "Click the 'Generate Interview Questions' button.",
                    "Review the generated questions."
                    
                  ]}
                />
              )}
              {activeTab === 'resume' && (
                <InstructionCard
                  title="Resume-Based Question Generation"
                  description="Generate interview questions based on a resume and job category."
                  steps={[
                    "Go to the Resume page.",
                    "Paste the resume content.",
                    "Select a job category.",
                    "Click 'Generate Questions'.",
                    "Review the generated questions.",
                    "Retry if needed."
                  ]}
                />
              )}
              {activeTab === 'matching' && (
                <InstructionCard
                  title="Resume and Job Description Matching"
                  description="Match resumes with job descriptions and generate questions."
                  steps={[
                    "Upload a resume.",
                    "Enter the job description.",
                    "Click 'Match Resumes'.",
                    "Review the similarity score.",
                    "Generate specific questions."
                  ]}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
