"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import styles from "../styles/Transfer.module.css"
import { BANKS } from "../constants/banks"

export default function Transfer() {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [selectedBank, setSelectedBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [recipientMemo, setRecipientMemo] = useState("")
  const [senderMemo, setSenderMemo] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false) // 계좌 검색 중 상태 추가
  const memberId = 1 // 실제 구현시 로그인한 사용자 ID를 사용

  // 계좌 목록 조회 - 입출금 계좌만 조회
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/transfers/all/checking-account?memberId=${memberId}`)
        if (!response.ok) throw new Error("Failed to fetch accounts")
        const data = await response.json()
        setAccounts(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching accounts:", error)
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // 계좌 검색 함수
  const handleAccountSearch = async (e) => {
    e.preventDefault() // 폼 제출 방지

    if (!selectedBank || !accountNumber) {
      alert("은행과 계좌번호를 모두 입력해주세요.")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`http://localhost:8080/api/accounts/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bankId: selectedBank,
          accountNumber: accountNumber,
        }),
      })

      if (!response.ok) {
        throw new Error("계좌 검색에 실패했습니다.")
      }

      const data = await response.json()

      if (data) {
        setRecipientName(data.accountHolder) // 예금주 설정
        setRecipientMemo(data.accountHolder) // 받는분 통장 표시를 예금주 이름으로 설정
        // 내 통장 표시는 출금 계좌 선택 시 이미 설정되어 있음
      } else {
        alert("계좌 정보를 찾을 수 없습니다.")
        setRecipientName("")
        setRecipientMemo("")
      }
    } catch (error) {
      console.error("Error searching account:", error)
      alert("계좌 검색 중 오류가 발생했습니다.")
      setRecipientName("")
      setRecipientMemo("")
    } finally {
      setIsSearching(false)
    }
  }

  // 금액 입력 시 천 단위 콤마 추가
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    setAmount(value ? Number.parseInt(value).toLocaleString() : "")
  }

  // 이체 실행
  const handleTransfer = async () => {
    if (!selectedAccount || !selectedBank || !accountNumber || !amount) {
      alert("필수 정보를 모두 입력해주세요.")
      return
    }

    if (!recipientName) {
      alert("계좌 검색을 먼저 진행해주세요.")
      return
    }

    try {
      const response = await fetch("http://localhost:8080/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAccountId: selectedAccount.accountId,
          toBankId: selectedBank,
          toAccountNumber: accountNumber,
          amount: Number(amount.replace(/,/g, "")),
          recipientMemo,
          senderMemo,
        }),
      })

      if (!response.ok) {
        throw new Error("이체에 실패했습니다.")
      }

      alert("이체가 성공적으로 완료되었습니다.")
      // 이체 성공 후 폼 초기화
      setAccountNumber("")
      setAmount("")
      setRecipientMemo("")
      setSenderMemo("")
      setRecipientName("")
    } catch (error) {
      console.error("Error during transfer:", error)
      alert("이체 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  const formatBalance = (balance) => {
    return balance?.toLocaleString() || "0"
  }

  if (isLoading) {
    return (
      <main className="main-content">
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>정보를 불러오는 중입니다...</p>
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
          <h2 className="page-title">이체정보 입력</h2>
        </div>

        <div className={styles.transferFormContainer}>
          {/* 출금계좌 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>출금계좌</label>
            <div className={styles.formRow}>
              <select
                className={styles.formSelect}
                value={selectedAccount?.accountId || ""}
                onChange={(e) => {
                  const selected = accounts.find((acc) => acc.accountId === Number.parseInt(e.target.value))
                  setSelectedAccount(selected)
                  // 선택된 계좌의 소유주 이름으로 받는분 통장 표시 설정
                  if (selected) {
                    setSenderMemo(selected.accountHolder || selected.senderName || "") // accountHolder나 senderName 중 있는 값 사용
                  }
                }}
              >
                <option value="">계좌를 선택하세요</option>
                {accounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.bankName} - {account.accountName}({account.accountNumber})
                  </option>
                ))}
              </select>
              <div className={styles.accountBalance}>
                출금가능금액 {formatBalance(selectedAccount?.balance || 0)} 원
              </div>
            </div>
          </div>

          {/* 입금계좌 입력 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>입금계좌</label>
            <div className={styles.formRow}>
              <select
                className={`${styles.formSelect} ${styles.bankSelect}`}
                value={selectedBank}
                onChange={(e) => {
                  setSelectedBank(e.target.value)
                  setRecipientName("") // 은행 변경 시 예금주 초기화
                }}
              >
                <option value="">은행 선택</option>
                {BANKS.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <div className={styles.accountNumberInputWrapper}>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.accountNumberInput}`}
                  placeholder="계좌번호 입력 (-없이 입력)"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
                    setRecipientName("") // 계좌번호 변경 시 예금주 초기화
                  }}
                />
                <button
                  className={styles.searchButton}
                  onClick={handleAccountSearch}
                  disabled={isSearching || !selectedBank || !accountNumber}
                >
                  {isSearching ? <div className={styles.searchSpinner} /> : <Search size={20} />}
                </button>
              </div>
            </div>
            {recipientName && <div className={styles.recipientName}>예금주: {recipientName}</div>}
          </div>

          {/* 입금금액 입력 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>입금금액</label>
            <div className={`${styles.formRow} ${styles.amountRow}`}>
              <input
                type="text"
                className={`${styles.formInput} ${styles.amountInput}`}
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
              />
              <span className={styles.currencyUnit}>원</span>
            </div>
            <div className={styles.amountInKorean}>일십만원</div>
          </div>

          <hr className={styles.formDivider} />

          {/* 받는분 통장 표시 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>받는분 통장 표시</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="최대 8자 입력 가능"
              maxLength={8}
              value={senderMemo}
              onChange={(e) => setSenderMemo(e.target.value)}
            />
          </div>

          {/* 내 통장 표시 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내 통장 표시</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="최대 8자 입력 가능"
              maxLength={8}
              value={recipientMemo}
              onChange={(e) => setRecipientMemo(e.target.value)}
            />
          </div>

          {/* 이체 버튼 */}
          <button
            className={styles.transferButton}
            onClick={handleTransfer}
            disabled={!selectedAccount || !selectedBank || !accountNumber || !amount || !recipientName}
          >
            확인
          </button>
        </div>
      </div>
    </main>
  )
}

