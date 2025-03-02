"use client"

import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import PropTypes from "prop-types"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import Products from "./components/Products"
import ProductDetail from "./components/ProductDetail"
import AutoTransferList from "./components/AutoTransferList"
import AutoTransferForm from "./components/AutoTransferForm"
import Settings from "./components/Settings"
import Transactions from "./components/Transactions"
import Transfer from "./components/Transfer"
import "./styles/App.css"

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
    <Routes>
      <Route
        path="/"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/products"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <Products />
          </Layout>
        }
      />
      <Route
        path="/products/:productType/:productId"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <ProductDetail />
          </Layout>
        }
      />
      <Route
        path="/autotransfer"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <AutoTransferList />
          </Layout>
        }
      />
      <Route
        path="/autotransfer/create"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <AutoTransferForm />
          </Layout>
        }
      />
      <Route
        path="/autotransfer/edit/:id"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <AutoTransferForm />
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <Settings />
          </Layout>
        }
      />
      <Route
        path="/transactions"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <Transactions />
          </Layout>
        }
      />
      <Route
        path="/transfer"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <Transfer />
          </Layout>
        }
      />
    </Routes>
  )
}

export default App
