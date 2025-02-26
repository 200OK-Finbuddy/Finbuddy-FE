"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "../styles/AutoTransfer.module.css"

export default function AutoTransferForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const memberId = 1 // 실제 구현시 로그인한 사용자의 ID를 사용

  const [formData, setFormData] = useState({
    fromAccountId: "",
    targetAccountNumber: "",
    amount: "",
    transferDay: "",
  })
  const [checkingAccounts, setCheckingAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(isEditing)

  // 이체일 옵션 생성 (1~31일)
  const transferDayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}일`,
  }))

  // // fetch 요청에 사용할 공통 options
  // const fetchOptions = {
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Access-Control-Allow-Origin": "*",
  //   },
  //   credentials: "include",
  // }

  useEffect(() => {
    const fetchCheckingAccounts = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/accounts/checking/${memberId}`)
        if (!response.ok) throw new Error("Failed to fetch accounts")
        const data = await response.json()
        setCheckingAccounts(data.top3Accounts)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching checking accounts:", error)
        setIsLoading(false)
      }
    }

    fetchCheckingAccounts()
  }, [])

  useEffect(() => {
    const fetchAutoTransferDetails = async () => {
      if (!isEditing) return

      try {
        const response = await fetch(`http://localhost:8080/api/autotransfer/${id}`)
        if (!response.ok) throw new Error("Failed to fetch auto transfer details")
        const data = await response.json()

        setFormData({
          fromAccountId: data.fromAccountId.toString(),
          targetAccountNumber: data.targetAccountNumber,
          amount: data.amount.toString(),
          transferDay: data.transferDay.toString(),
        })
      } catch (error) {
        console.error("Error fetching auto transfer details:", error)
      } finally {
        setIsLoadingTransfer(false)
      }
    }

    fetchAutoTransferDetails()
  }, [id, isEditing])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = isEditing ? `http://localhost:8080/api/autotransfer/${id}` : "http://localhost:8080/api/autotransfer"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        // ...fetchOptions,
        method,
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount.replace(/,/g, "")),
          transferDay: Number(formData.transferDay),
          fromAccountId: Number(formData.fromAccountId),
        }),
      })

      if (!response.ok) throw new Error("Failed to save auto transfer")
      navigate("/autotransfer")
    } catch (error) {
      console.error("Error saving auto transfer:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formatAmount = (value) => {
    if (!value) return ""
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "")
    // 천단위 콤마 추가
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleAmountChange = (e) => {
    const { value } = e.target
    const numbers = value.replace(/[^\d]/g, "")
    setFormData((prev) => ({
      ...prev,
      amount: numbers,
    }))
  }

  if (isLoading || isLoadingTransfer) {
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
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>정보를 불러오는 중입니다...</p>
            </div>
          </div>
        </div>
      </main>
    )
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
                className={styles.accountSelect}
              >
                <option value="">출금 계좌를 선택하세요</option>
                {checkingAccounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountName} | {account.accountNumber}
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
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount">이체 금액</label>
              <div className={styles.amountInputWrapper}>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={formData.amount ? formatAmount(formData.amount) : ""}
                  onChange={handleAmountChange}
                  placeholder="이체 금액을 입력하세요"
                  required
                  className={styles.formInput}
                />
                <span className={styles.wonSymbol}>원</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="transferDay">이체일</label>
              <select
                id="transferDay"
                name="transferDay"
                value={formData.transferDay}
                onChange={handleChange}
                required
                className={styles.accountSelect}
              >
                <option value="">이체일을 선택하세요</option>
                {transferDayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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

