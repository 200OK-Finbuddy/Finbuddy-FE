"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Search } from "lucide-react"
import styles from "../styles/AutoTransfer.module.css"
import { BANKS } from "../constants/banks"
import PasswordInputKeypad from "./PasswordInputKeypad"

export default function AutoTransferForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const memberId = 1 // 실제 구현시 로그인한 사용자의 ID를 사용

  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [selectedBank, setSelectedBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [recipientMemo, setRecipientMemo] = useState("")
  const [senderMemo, setSenderMemo] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [transferDay, setTransferDay] = useState("")

  // 이체일 옵션 생성 (1~31일)
  const transferDayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}일`,
  }))

  // 계좌 목록 조회
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

  // 자동이체 상세 정보 조회
  useEffect(() => {
    const fetchAutoTransferDetails = async () => {
      if (!isEditing) return

      try {
        const response = await fetch(`http://localhost:8080/api/autotransfer/${id}`)
        if (!response.ok) throw new Error("Failed to fetch auto transfer details")
        const data = await response.json()

        setSelectedAccount(accounts.find((acc) => acc.accountId === data.fromAccountId))
        setSelectedBank(data.targetBankName)
        setAccountNumber(data.targetAccountNumber)
        setAmount(data.amount.toString())
        setTransferDay(data.transferDay.toString())
        setRecipientName(data.receiverName)
        setRecipientMemo(data.receiverMemo || "")
        setSenderMemo(data.senderMemo || "")
      } catch (error) {
        console.error("Error fetching auto transfer details:", error)
      }
    }

    if (accounts.length > 0) {
      fetchAutoTransferDetails()
    }
  }, [id, isEditing, accounts])

  // 계좌 검색 함수
  const handleAccountSearch = async (e) => {
    e.preventDefault()

    if (!selectedBank || !accountNumber) {
      alert("은행과 계좌번호를 모두 입력해주세요.")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `http://localhost:8080/api/transfers/receiving-account?bankName=${selectedBank}&accountNumber=${accountNumber}`,
      )

      if (!response.ok) {
        throw new Error("계좌 검색에 실패했습니다.")
      }

      const data = await response.json()
      setRecipientName(data.receiverName)
      setSenderMemo(data.receiverName) // 내 통장 표시에 수취인 이름 설정
    } catch (error) {
      console.error("Error searching account:", error)
      alert("계좌 검색 중 오류가 발생했습니다.")
      setRecipientName("")
      setSenderMemo("")
    } finally {
      setIsSearching(false)
    }
  }

  // 금액 입력 시 천 단위 콤마 추가
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    setAmount(value ? Number.parseInt(value).toLocaleString() : "")
  }

  // 계좌 선택 핸들러 수정
  const handleAccountSelect = (e) => {
    const selected = accounts.find((acc) => acc.accountId === Number.parseInt(e.target.value))
    setSelectedAccount(selected)
    // 선택된 계좌의 소유주 이름으로 받는분 통장 표시 설정
    if (selected) {
      setRecipientMemo(selected.accountHolder || selected.senderName || "") // senderName도 체크
    }
  }

  const formatBalance = (balance) => {
    return balance?.toLocaleString() || "0"
  }

  const ConfirmModal = () => {
    const [modalPassword, setModalPassword] = useState("")
    const [modalResetPassword, setModalResetPassword] = useState(false)
    const [isPasswordVerified, setIsPasswordVerified] = useState(false)

    const handleModalPasswordComplete = (value) => {
      setModalPassword(value)
    }

    const verifyPassword = async (accountId, password) => {
      try {
        const response = await fetch(`http://localhost:8080/api/accounts/verify-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId,
            password,
          }),
        })

        if (!response.ok) {
          throw new Error("비밀번호 검증에 실패했습니다.")
        }

        const data = await response.json()
        return data.valid
      } catch (error) {
        console.error("Error verifying password:", error)
        return false
      }
    }

    const handlePasswordVerification = async () => {
      if (!modalPassword) {
        alert("비밀번호를 입력해주세요.")
        return
      }

      // 비밀번호 검증
      const isValid = await verifyPassword(selectedAccount.accountId, modalPassword)

      if (isValid) {
        setIsPasswordVerified(true)
      } else {
        alert("비밀번호가 일치하지 않습니다.")
        setModalPassword("")
        setModalResetPassword((prev) => !prev)
      }
    }

    const handleModalSubmit = async () => {
      try {
        const url = isEditing
          ? `http://localhost:8080/api/autotransfer/${id}`
          : "http://localhost:8080/api/autotransfer"

        const response = await fetch(url, {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAccountId: selectedAccount.accountId,
            toBankName: selectedBank,
            toAccountNumber: accountNumber,
            amount: Number(amount.replace(/,/g, "")),
            transferDay: Number(transferDay),
            password: modalPassword,
            senderMemo: senderMemo,
            receiverMemo: recipientMemo,
          }),
        })

        if (!response.ok) {
          throw new Error(isEditing ? "자동이체 수정에 실패했습니다." : "자동이체 등록에 실패했습니다.")
        }

        alert(isEditing ? "자동이체가 성공적으로 수정되었습니다." : "자동이체가 성공적으로 등록되었습니다.")
        navigate("/autotransfer")
      } catch (error) {
        console.error("Error saving auto transfer:", error)
        alert(error.message)
        setModalPassword("")
        setModalResetPassword((prev) => !prev)
        setIsPasswordVerified(false)
      }
    }

    if (!showConfirmModal) return null

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>자동이체 {isEditing ? "수정" : "등록"} 확인</h3>
          <div className={styles.modalInfo}>
            <div className={styles.modalInfoItem}>
              <span className={styles.modalLabel}>출금계좌</span>
              <span className={styles.modalValue}>
                {selectedAccount?.bankName} {selectedAccount?.accountNumber}
              </span>
            </div>
            <div className={styles.modalInfoItem}>
              <span className={styles.modalLabel}>입금계좌</span>
              <span className={styles.modalValue}>
                {selectedBank} {accountNumber}
              </span>
            </div>
            <div className={styles.modalInfoItem}>
              <span className={styles.modalLabel}>이체금액</span>
              <span className={styles.modalValue}>{amount}원</span>
            </div>
            <div className={styles.modalInfoItem}>
              <span className={styles.modalLabel}>이체일</span>
              <span className={styles.modalValue}>매월 {transferDay}일</span>
            </div>
            <div className={styles.modalInfoItem}>
              <span className={styles.modalLabel}>받는분</span>
              <span className={styles.modalValue}>{recipientName}</span>
            </div>
          </div>

          <div className={styles.modalPasswordSection}>
            <label className={styles.modalLabel}>비밀번호</label>
            <PasswordInputKeypad onPasswordComplete={handleModalPasswordComplete} reset={modalResetPassword} />
            {!isPasswordVerified && (
              <button
                className={styles.modalVerifyButton}
                onClick={handlePasswordVerification}
                disabled={!modalPassword}
              >
                비밀번호 확인
              </button>
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.modalCancelButton}
              onClick={() => {
                setShowConfirmModal(false)
                setModalPassword("")
                setModalResetPassword((prev) => !prev)
                setIsPasswordVerified(false)
              }}
            >
              취소
            </button>
            <button className={styles.modalSubmitButton} onClick={handleModalSubmit} disabled={!isPasswordVerified}>
              {isEditing ? "수정" : "등록"}
            </button>
          </div>
        </div>
      </div>
    )
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
          <h2 className="page-title">{isEditing ? "자동이체 수정" : "자동이체 등록"}</h2>
        </div>

        <div className={styles.transferFormContainer}>
          {/* 출금계좌 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>출금계좌</label>
            <div className={styles.formRow}>
              <select
                className={styles.formSelect}
                value={selectedAccount?.accountId || ""}
                onChange={handleAccountSelect}
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
                  setRecipientName("")
                }}
              >
                <option value="">은행 선택</option>
                {BANKS.map((bank) => (
                  <option key={bank.id} value={bank.originName}>
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
                    setAccountNumber(e.target.value)
                    setRecipientName("")
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

          {/* 이체일 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이체일</label>
            <select className={styles.formSelect} value={transferDay} onChange={(e) => setTransferDay(e.target.value)}>
              <option value="">이체일을 선택하세요</option>
              {transferDayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <hr className={styles.formDivider} />

          {/* 받는분 통장 표시 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>받는분 통장 표시</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder=""
              maxLength={15}
              value={recipientMemo}
              onChange={(e) => setRecipientMemo(e.target.value)}
            />
          </div>

          {/* 내 통장 표시 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내 통장 표시</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder=""
              maxLength={15}
              value={senderMemo}
              onChange={(e) => setSenderMemo(e.target.value)}
            />
          </div>

          {/* 확인 버튼 */}
          <button
            className={styles.transferButton}
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedAccount || !selectedBank || !accountNumber || !amount || !transferDay || !recipientName}
          >
            확인
          </button>
        </div>
      </div>
      <ConfirmModal />
    </main>
  )
}

