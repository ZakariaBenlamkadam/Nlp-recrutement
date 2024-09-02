import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import Main from './components/Main';
import QuestionGeneration from './components/QuestionGeneration';

function App() {
  

  return (
    <div className="container">
      <Header/>
      <QuestionGeneration/>
      <Footer/>
    </div>
  );
}

export default App;
