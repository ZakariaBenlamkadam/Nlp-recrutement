import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { FaBars } from 'react-icons/fa';

function LandingPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isButtonVisible, setIsButtonVisible] = useState(true);

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
        <div className="app-container">
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <a href="#" className="sidebar-logo">
                        <span className="sidebar-title">TalentQuest</span>
                    </a>
                </div>
                <nav className="sidebar-nav">
                    <div className="collapsible">
                        <div
                            className="collapsible-trigger"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <span>Home</span>
                        </div>
                    </div>
                    <a href="#" className="sidebar-link">Profile</a>
                    <a href="#" className="sidebar-link">Settings</a>
                    <a href="#" className="sidebar-link">Help</a>
                </nav>
                <div className="sidebar-footer">
                    <button className="button-secondary">Get Started</button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
                <header className="header">
                    <a href="#" className="header-logo">
                        <span className="header-title">TalentQuest</span>
                    </a>

                    <nav className="header-nav">
                        <a href="#" className="header-link">Home</a>
                        <a href="#" className="header-link">Features</a>
                        <a href="#" className="header-link">Pricing</a>
                        <a href="#" className="header-link">Contact</a>

                        <button className="button-primary">Get Started</button>
                    </nav>

                    <button
                        className={`sidebar-toggle ${isButtonVisible ? '' : 'hidden'}`}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <FaBars />
                    </button>
                </header>

                <main>
                    <section className="hero-section">
                        <div className="hero-content">
                            <h1>Unlock Smarter Hiring with TalentQuest</h1>
                            <p>Our AI-powered platform helps recruiters find the best resume matches for their job descriptions and generates tailored interview questions to streamline the hiring process.</p>
                            <button className="button-primary">Get Started</button>
                        </div>
                        <div className="hero-image">
                            <img src="./rec.jpg" alt="Hero" />
                        </div>
                    </section>

                    <section className="features-section">
                        <h2>Tailored Resume Matching</h2>
                        <div className="features-grid">
                            <div className="feature-box">
                                <h3>Personalized Job Search</h3>
                                <p>Our AI-powered search engine finds the perfect job matches for your skills and experience.</p>
                            </div>
                            <div className="feature-box">
                                <h3>Resume Optimization</h3>
                                <p>Get personalized feedback to improve your resume and increase your chances of landing an interview.</p>
                            </div>
                            <div className="feature-box">
                                <h3>Interview Preparation</h3>
                                <p>Prepare for interviews with personalized questions and practice sessions designed to help you succeed.</p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="footer">
                    <div className="footer-content">
                        <a href="#" className="footer-link">Privacy Policy</a>
                        <a href="#" className="footer-link">Terms of Service</a>
                        <a href="#" className="footer-link">Contact Us</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default LandingPage;
