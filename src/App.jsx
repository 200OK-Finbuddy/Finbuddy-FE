"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PropTypes from "prop-types"
import "./styles/App.css"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import SignupForm from "./components/SignupForm"
import Products from "./components/Products"

// Layout 컴포넌트를 분리하고 setActiveNav를 props로 전달
const Layout = ({ children, navType, onNavChange }) => {
  return (
    <div className="app">
      <Sidebar activeNav={navType} setActiveNav={onNavChange} />
      {children}
    </div>
  )
}

// PropTypes 업데이트
Layout.propTypes = {
  children: PropTypes.node.isRequired,
  navType: PropTypes.string.isRequired,
  onNavChange: PropTypes.func.isRequired,
}

function App() {
  const [activeNav, setActiveNav] = useState("dashboard")

  return (
    <Router>
      <Routes>
        {/* 메인 대시보드 */}
        <Route
          path="/"
          element={
            <Layout navType={activeNav} onNavChange={setActiveNav}>
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
            <Layout navType={activeNav} onNavChange={setActiveNav}>
              <Products />
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

