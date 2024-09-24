import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import './Layout.css';

function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isButtonVisible, setIsButtonVisible] = React.useState(true);
    const navigate = useNavigate();

    // Retrieve authentication status from localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    React.useEffect(() => {
        let lastScrollTop = 0;

        const handleScroll = () => {
            const currentScrollTop = window.scrollY;
            if (currentScrollTop > lastScrollTop) {
                setIsButtonVisible(false);
            } else {
                setIsButtonVisible(true);
            }
            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/sign-in');
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <a href="#" className="sidebar-logo">
                        <span className="sidebar-title">TalentQuest</span>
                    </a>
                </div>
                <nav className="sidebar-nav">
                    <div className="collapsible">
                        <Link to="/" className="sidebar-link">
                        <div className="icon1 home-icon"></div> Home
                        </Link>
                    </div>
                    {isAuthenticated && (
                        <>
                            <Link to="/resume-match" className="sidebar-link">
                                <img src="/assets/logo.png" alt="Resume Match" className="icon1" /> ResumeMatch
                            </Link>
                            <Link to="/quest-ai" className="sidebar-link">
                                <img src="/assets/logo.png" alt="Quest AI" className="icon" /> QuestAi
                            </Link>
                            <Link to="/resume-quest" className="sidebar-link">
                                <img src="/assets/logo.png" alt="Resume Quest" className="icon" /> ResumeQuest
                            </Link>
                        </>
                    )}
                    <Link to="/settings" className="sidebar-link">
                        <img src="/assets/settings.png" alt="Settings" className="icon" /> Settings
                    </Link>
                </nav>
                {isAuthenticated && (
                    <div className="sidebar-footer">
                        <button onClick={handleLogout} className="button-secondary1">Logout</button>
                    </div>
                )}
                {!isAuthenticated && (
                    <div className="sidebar-footer">
                        <button className="button-secondary1">
                            <Link to="/sign-in" className="no-link-style">Sign In</Link>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
                <header className="header">
                    <a href="#" className="header-logo">
                        <Link to="/" className="header-title">TalentQuest</Link>
                    </a>

                    <nav className="header-nav">
                        <Link to="/" className="header-link">Home</Link>
                        <Link to="/" className="header-link">Features</Link>
                        <Link to="/" className="header-link">Pricing</Link>
                        <Link to="/" className="header-link">Contact</Link>
                        <Link to="/sign-in" className="header-signin">Get Started</Link>
                    </nav>

                    <button
                        className={`sidebar-toggle ${isButtonVisible ? '' : 'hidden'}`}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <FaBars />
                    </button>
                </header>

                <main>
                    <Outlet />
                </main>
            </div>

            <footer className={`footer ${isSidebarOpen ? 'shifted' : ''}`}>
                <div className="footer-content">
                    <p>© 2024 TalentQuest All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Layout;
