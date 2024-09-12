import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';  // Import useState for authentication
import Layout from './components/Layout'; // Import the Layout component
import LandingPage from './components/LandingPage';
import Main from './components/Main';
import QuestionGeneration from './components/QuestionGeneration';
import ResumeQuest from './components/ResumeQuest'; // Import the new component
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';


function App() {
  // Step 1: Set up authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Step 2: Create a PrivateRoute component to check authentication
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/sign-in" />;
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          {/* Step 3: Protected routes that require authentication */}
          <Route path="resume-match" element={<PrivateRoute element={<Main />} />} />
          <Route path="quest-ai" element={<PrivateRoute element={<QuestionGeneration />} />} />
          <Route path="resume-quest" element={<PrivateRoute element={<ResumeQuest />} />} /> 
           
          {/* Step 4: Public routes */}
          <Route path="/sign-in" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} /> 
          <Route path="/sign-up" element={<SignUp />} /> 
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
