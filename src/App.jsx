import { useState } from 'react';
import './styles/App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="app">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <Dashboard activeNav={activeNav} />
    </div>
  );
}

export default App;
