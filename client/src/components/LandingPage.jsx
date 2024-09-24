import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { FaBars } from 'react-icons/fa';

function LandingPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    useEffect(() => {
        let lastScrollTop = 0;

        const handleScroll = () => {
            const currentScrollTop = window.scrollY;
            if (currentScrollTop > lastScrollTop) {
                // Scrolling down
                setIsButtonVisible(false);
            } else {
                // Scrolling up
                setIsButtonVisible(true);
            }
            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        };

        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="app-container1">
            {/* Main Content */}
                <main>
                    <section className="hero-section">
                        <div className="hero-content">
                            <h1>Unlock Smarter Hiring with TalentQuest</h1>
                            <p>Our AI-powered platform helps recruiters find the best resume matches for their job descriptions and generates tailored interview questions to streamline the hiring process.</p>
                            {isAuthenticated && ( <Link to="/sign-in" className="button-primary1">Get Started</Link>
                            )}
                            {!isAuthenticated && ( <Link to="/sign-in" className="button-primary1">Get Started</Link>

                    )}
                        </div>
                        <div className="hero-image">
                            <img src="./rec.jpg" alt="Hero" />
                        </div>
                    </section>

                    <section className="features-section">
                        <h2>Tailored Talent Matching</h2>
                        <div className="features-grid">
                            <div className="feature-box">
                            <img src="question.png" alt="Interview Icon" className="feature-icon" />
                            <h3>Interview Question Generator</h3>
                            <p>Generate customized interview questions instantly based on the job description and resume you provide.</p>
                            </div>
                            <div className="feature-box">
                            <img src="resume.png" alt="AI Question Generator Icon" className="feature-icon" />
                            <h3>AI Resume-Based Question Generator</h3>
                            <p>Instantly generate tailored interview questions by pasting your resume and selecting a job category.</p>
                            </div>
                            <div className="feature-box">
                            <img src="preparation.png" alt="Preparation Icon" className="feature-icon" />
                            <h3>Interview Preparation</h3>
                            <p>Prepare for interviews with personalized questions and practice sessions designed to help you succeed.</p>
                            </div>
                        </div>
                        </section>

                </main> 
            </div>
        
    );
}

export default LandingPage;
