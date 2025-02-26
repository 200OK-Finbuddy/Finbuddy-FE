"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "../styles/AutoTransfer.module.css"

export default function AutoTransferForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    fromAccountId: "",
    targetAccountNumber: "",
    amount: "",
    transferDay: "",
  })
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    // 사용자의 계좌 목록 조회
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/accounts/list/1") // memberId는 실제 구현시 동적으로 처리
        if (!response.ok) throw new Error("Failed to fetch accounts")
        const data = await response.json()
        setAccounts(data)
      } catch (error) {
        console.error("Error fetching accounts:", error)
      }
    }

    fetchAccounts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = isEditing ? `http://localhost:8080/api/autotransfer/${id}` : "http://localhost:8080/api/autotransfer"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save auto transfer")
      navigate("/autotransfer") // 목록 페이지로 이동
    } catch (error) {
      console.error("Error saving auto transfer:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" || name === "transferDay" ? Number(value) : value,
    }))
  }

  return (
    <main className="main-content">
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>

      <div className="content-container">
        <div className="page-header">
          <h2 className="page-title">{isEditing ? "자동이체 수정" : "자동이체 등록"}</h2>
        </div>

        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="fromAccountId">출금 계좌</label>
              <select
                id="fromAccountId"
                name="fromAccountId"
                value={formData.fromAccountId}
                onChange={handleChange}
                required
              >
                <option value="">출금 계좌를 선택하세요</option>
                {accounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.bankName} - {account.accountNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="targetAccountNumber">입금 계좌번호</label>
              <input
                type="text"
                id="targetAccountNumber"
                name="targetAccountNumber"
                value={formData.targetAccountNumber}
                onChange={handleChange}
                placeholder="입금 계좌번호를 입력하세요"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount">이체 금액</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="이체 금액을 입력하세요"
                min="1000"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="transferDay">이체일</label>
              <input
                type="number"
                id="transferDay"
                name="transferDay"
                value={formData.transferDay}
                onChange={handleChange}
                placeholder="매월 이체일을 입력하세요 (1-31)"
                min="1"
                max="31"
                required
              />
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={() => navigate("/autotransfer")}>
                취소
              </button>
              <button type="submit" className={styles.submitButton}>
                {isEditing ? "수정" : "등록"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

