"use client"

import "../styles/Dashboard.css"
import AccountSection from "./AccountSection"
import TransactionSection from "./TransactionSection"
import RecommendedProducts from "./RecommendedProducts"
import ExpenseChart from "./ExpenseChart"
import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import axios from "axios"

function Dashboard({ setActiveNav }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("/api/transactions")
        setTransactions(response.data)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main className="main-content">
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>

      <div className="account-grid">
        <AccountSection />
        <RecommendedProducts setActiveNav={setActiveNav} />
      </div>

      <div className="content-grid">
        <TransactionSection transactions={transactions} />
        <ExpenseChart transactions={transactions} />
      </div>
    </main>
  )
}

Dashboard.propTypes = {
  setActiveNav: PropTypes.func.isRequired, // 추가
}

export default Dashboard

