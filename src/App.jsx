import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SignupForm from './components/SignupForm';

function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <Router>
      <Routes>
        {/* 메인 대시보드 */}
        <Route
          path="/"
          element={
            <div className="app">
              <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
              <Dashboard activeNav={activeNav} />
            </div>
          }
        />
        
        {/* 회원가입 페이지 */}
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </Router>
  );
}

export default App;