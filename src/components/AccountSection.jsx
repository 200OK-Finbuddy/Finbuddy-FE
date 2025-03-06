"use client"

import API_URL from "../config"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/AccountSection.css"
import PropTypes from "prop-types"

function AccountSection({ setActiveNav }) {
  const [accountSummary, setAccountSummary] = useState({
    totalBalance: 0,
    top3Accounts: [],
    totalAccounts: 0, // Added totalAccounts to state
  })
  const navigate = useNavigate()

  const getCheckingAccounts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/accounts/checking/4`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setAccountSummary(data)
    } catch (error) {
      console.error("Error fetching checking accounts:", error)
    }
  }, [])

  useEffect(() => {
    getCheckingAccounts()
  }, [getCheckingAccounts])

  // 금액 포맷팅 함수
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount)
  }

  // 계좌 상세 정보로 이동하는 함수
  const handleAccountClick = (account) => {
    // 거래내역 페이지로 이동하고 해당 계좌 ID를 URL 파라미터로 전달
    navigate(`/transactions?accountId=${account.accountId}`)
    // 네비게이션 상태 업데이트
    if (setActiveNav) {
      setActiveNav("transactions")
    }
  }

  // 송금 페이지로 이동하는 함수
  const handleTransferClick = () => {
    navigate("/transfer")
    if (setActiveNav) {
      setActiveNav("transfer")
    }
  }

  return (
    <section className="account-section">
      <div className="account-header">
        <div className="account-title">
          <h2>입출금 계좌</h2>
          <span className="total-amount">{formatAmount(accountSummary.totalBalance)}원</span>
        </div>
        <button className="transfer-btn" onClick={handleTransferClick}>
          송금
        </button>
      </div>

      <div className="account-list">
        {accountSummary.top3Accounts.map((account) => (
          <div
            key={account.accountId}
            className="account-item"
            onClick={() => handleAccountClick(account)} // Add click handler to the entire div
          >
            <div className="account-info">
              <div className="bank-logo">
                <img src={account.bankLogoUrl || "/placeholder.svg"} alt="bank logo" />
              </div>
              <div className="account-details">
                <h3>{account.accountName}</h3>
                <p>{account.accountNumber}</p>
              </div>
            </div>
            <div className="amount-info">
              <span className="amount-button">{formatAmount(account.balance)}원</span>
              <span className="arrow-button">›</span>
            </div>
          </div>
        ))}

        {/* 더보기 버튼 - 계좌가 3개 이상일 때만 표시 */}
        {accountSummary.checkingAccountsCount > 3 && (
          <div
            className="see-more"
            onClick={() => {
              navigate("/transactions")
              if (setActiveNav) {
                setActiveNav("transactions")
              }
            }}
          >
            더보기
            <span className="see-more-icon">›</span>
          </div>
        )}
      </div>
    </section>
  )
}

AccountSection.propTypes = {
  setActiveNav: PropTypes.func,
}

AccountSection.defaultProps = {
  setActiveNav: () => {},
}

export default AccountSection

