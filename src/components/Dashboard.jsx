"use client"

import "../styles/Dashboard.css"
import AccountSection from "./AccountSection"
import TransactionSection from "./TransactionSection"
import RecommendedProducts from "./RecommendedProducts"
import ExpenseChart from "./ExpenseChart"
import PropTypes from "prop-types"

function Dashboard({ setActiveNav }) {
  return (
    <main className="main-content">
      <div className="account-grid">
        <AccountSection />
        <RecommendedProducts setActiveNav={setActiveNav} />
      </div>

      <div className="content-grid">
        <TransactionSection />
        <ExpenseChart />
      </div>
    </main>
  )
}

Dashboard.propTypes = {
  setActiveNav: PropTypes.func.isRequired,
}

export default Dashboard