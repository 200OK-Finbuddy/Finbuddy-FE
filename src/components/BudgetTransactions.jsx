"use client"

import API_URL from "../config"
import { useState, useEffect } from "react"
import styles from "../styles/BudgetTransactions.module.css"
import axios from "axios"

function BudgetTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await axios.get(`${API_URL}/api/budgets/checking/recent`, {
          withCredentials: true, // 쿠키 및 인증 정보 포함
        });        

        if (!response.ok) {
          throw new Error("거래내역을 불러오는데 실패했습니다.")
        }

        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error("Error fetching budget transactions:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount)
  }

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>이번 달 거래내역</h2>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>거래내역을 불러오는 중입니다...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>이번 달 거래내역</h2>
        </div>
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2>이번 달 거래내역</h2>
      </div>
      {transactions.length === 0 ? (
        <div className={styles.noTransactions}>
          <p>이번 달 거래내역이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.transactionList}>
          <div className={styles.listHeader}>
            <div className={styles.headerItem}>계좌명</div>
            <div className={styles.headerItem}>계좌번호</div>
            <div className={styles.headerItem}>거래처</div>
            <div className={styles.headerItem}>거래일시</div>
            <div className={styles.headerItemRight}>거래금액</div>
            <div className={styles.headerItemRight}>잔액</div>
          </div>
          {transactions.map((transaction, index) => (
            <div key={index} className={styles.transactionItem}>
              <div className={styles.accountName}>
                <span className={styles.primaryText}>{transaction.accountName}</span>
              </div>
              <div className={styles.accountNumber}>
                <span className={styles.secondaryText}>{transaction.accountNumber}</span>
              </div>
              <div className={styles.transactionPlace}>
                <span className={styles.primaryText}>{transaction.opponentName}</span>
              </div>
              <div className={styles.transactionDate}>
                <span className={styles.primaryText}>{formatDate(transaction.transactionDate)}</span>
              </div>
              <div className={styles.transactionAmount}>
                <span
                  className={`${styles.primaryText} ${transaction.transactionType === 1 ? styles.income : styles.expense}`}
                >
                  {transaction.transactionType === 1 ? "+" : "-"}
                  {formatAmount(transaction.amount)}원
                </span>
              </div>
              <div className={styles.transactionBalance}>
                <span className={styles.secondaryText}>{formatAmount(transaction.updatedBalance)}원</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default BudgetTransactions

