"use client"

import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import MainPage from "./components/Mainpage"
import Layout from "./components/Layout"
import Dashboard from "./components/Dashboard"
import Products from "./components/Products"
import ProductDetail from "./components/ProductDetail"
import AutoTransferList from "./components/AutoTransferList"
import AutoTransferForm from "./components/AutoTransferForm"
import Settings from "./components/Settings"
import Transactions from "./components/Transactions"
import Transfer from "./components/Transfer"
import Budget from "./components/Budget"
import "./styles/App.css"

function App() {
  const [activeNav, setActiveNav] = useState("dashboard")

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />

      <Route
        path="/dashboard"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <Dashboard setActiveNav={setActiveNav} />
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
        path="/budget"
        element={
          <Layout navType={activeNav} onNavChange={setActiveNav}>
            <Budget />
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

