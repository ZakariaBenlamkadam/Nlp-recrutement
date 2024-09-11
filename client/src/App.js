import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout'; // Import the Layout component
import LandingPage from './components/LandingPage';
import Main from './components/Main';
import QuestionGeneration from './components/QuestionGeneration';
import ResumeQuest from './components/ResumeQuest'; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="resume-match" element={<Main />} />
          <Route path="quest-ai" element={<QuestionGeneration />} />
          <Route path="resume-quest" element={<ResumeQuest />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
