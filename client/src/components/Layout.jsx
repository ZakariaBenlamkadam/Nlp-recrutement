import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import useWindowWidth from './useWindowWidth'; // Adjust the path as needed
import './Layout.css';

function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false); // For Home link dropdown
    const [isButtonVisible, setIsButtonVisible] = React.useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const windowWidth = useWindowWidth();  // Get window width

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

    // Function to toggle dropdown on click in mobile
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <a href="#" className="sidebar-logo">
                        <span className="sidebar-title">TalentQuest</span>
                    </a>
                </div>
                <nav className="sidebar-nav">
                <div className="collapsible">
                    {windowWidth < 700 ? (
                        <div
                            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
                            onClick={toggleDropdown}  // Toggle dropdown only for small screens
                        >
                            <div className="icon1 home-icon"></div>
                            {isSidebarOpen && <span>Home</span>}

                            {/* Dropdown for small screens */}
                            {isDropdownOpen && (
                                <div className="dropdown-content">
                                    <Link to="/" className="sidebar-link">Home</Link>
                                    <Link to="/doc" className="sidebar-link">Documentation</Link>
                                    <Link to="/pricing" className="sidebar-link">Pricing</Link>
                                    <Link to="/contact" className="sidebar-link">Contact</Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Direct Home link for larger screens */
                        <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
                            <div className="icon1 home-icon"></div>
                            {isSidebarOpen && <span>Home</span>}
                        </Link>
                    )}
                </div>


                    
                    {isAuthenticated && (
                        <>
                            <Link to="/resume-match" className={`sidebar-link1 ${location.pathname === '/resume-match' ? 'active' : ''}`}>
                                <div className="icon1 match-icon"></div>
                                {isSidebarOpen && <span>ResumeMatch</span>}
                            </Link>
                            <Link to="/quest-ai" className={`sidebar-link1 ${location.pathname === '/quest-ai' ? 'active' : ''}`}>
                                <div className="icon1 job-icon"></div>
                                {isSidebarOpen && <span>QuestAi</span>}
                            </Link>
                            <Link to="/resume-quest" className={`sidebar-link ${location.pathname === '/resume-quest' ? 'active' : ''}`}>
                                <div className="icon1 question-icon"></div>
                                {isSidebarOpen && <span>ResumeQuest</span>}
                            </Link>
                        </>
                    )}
                    <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
                        <div className="icon1 settings-icon"></div>
                        {isSidebarOpen && <span>Settings</span>}
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

                    {/* Header Links - Hidden on small screens */}
                    <nav className="header-nav">
                        {windowWidth >= 700 && (
                            <>
                                <Link to="/" className="header-link">Home</Link>
                                <Link to="/doc" className="header-link">Documentation</Link>
                                <Link to="/pricing" className="header-link">Pricing</Link>
                                <Link to="/contact" className="header-link">Contact</Link>
                            </>
                        )}
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
