import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SignupForm from './components/SignupForm';
import Products from './components/Products';

function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  // 사이드바와 함께 보여줄 레이아웃
  const Layout = ({ children, navType }) => {
    return (
      <div className="app">
        <Sidebar activeNav={navType} setActiveNav={setActiveNav} />
        {children}
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* 메인 대시보드 */}
        <Route
          path="/"
          element={
            <Layout navType="dashboard">
              <Dashboard />
            </Layout>
          }
        />
        
        {/* 회원가입 페이지 */}
        <Route path="/signup" element={<SignupForm />} />

        {/* 예/적금 상품 목록 페이지 */}
        <Route
          path="/products"
          element={
            <Layout navType="products">
              <Products />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;