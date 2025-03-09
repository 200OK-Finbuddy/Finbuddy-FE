"use client"

import API_URL from "../config"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import styles from "../styles/Transfer.module.css"
import { BANKS } from "../constants/banks"
import PasswordInputKeypad from "./PasswordInputKeypad"

// 금액에 단위만 한글로 표시하는 함수를 다음 함수로 교체
const formatAmountWithKoreanUnit = (amount) => {
  if (!amount) return ""

  // 콤마 제거 및 숫자로 변환
  const num = Number.parseInt(amount.toString().replace(/,/g, ""))

  if (num === 0) return "0원"

  // 최대 입력 가능 금액 (100억 미만)
  if (num >= 10000000000) {
    return "입력 가능한 최대 금액을 초과했습니다"
  }

  // 억, 만 단위로 분리
  const eok = Math.floor(num / 100000000)
  const man = Math.floor((num % 100000000) / 10000)
  const rest = num % 10000

  let result = ""

  if (eok > 0) {
    result += eok + "억"
  }

  if (man > 0) {
    result += man + "만"
  }

  if (rest > 0) {
    result += rest
  }

  return result + "원"
}

export default function Transfer() {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [selectedBank, setSelectedBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [amountInKorean, setAmountInKorean] = useState("") // 수정된 부분
  const [recipientMemo, setRecipientMemo] = useState("")
  const [senderMemo, setSenderMemo] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertTitle, setAlertTitle] = useState("알림")
  const [alertCallback, setAlertCallback] = useState(null)
  const memberId = 4

  // 계좌 목록 조회 - 입출금 계좌만 조회
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/transfers/all/checking-account?memberId=${memberId}`)
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

  // 알림 모달 표시 함수
  const showAlert = (title, message, callback = null) => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertCallback(callback)
    setShowAlertModal(true)
  }

  // 계좌 검색 함수
  const handleAccountSearch = async (e) => {
    e.preventDefault()

    if (!selectedBank || !accountNumber) {
      showAlert("입력 오류", "은행과 계좌번호를 모두 입력해주세요.")
      return
    }

    setIsSearching(true)
    try {
      // 새로운 API 엔드포인트 사용
      const response = await fetch(
        `${API_URL}/api/transfers/receiving-account?bankName=${selectedBank}&accountNumber=${accountNumber}`,
      )
      console.log(selectedBank)

      if (!response.ok) {
        throw new Error("계좌 검색에 실패했습니다.")
      }

      const data = await response.json()

      // 계좌 정보가 확인되면 모달 표시 및 정보 설정
      setRecipientName(data.receiverName)
      setSenderMemo(data.receiverName) // 내 통장 표시에 수취인 이름 설정

      // 모달 표시 - 변수명 변경
      setShowAccountModal(true)
    } catch (error) {
      console.error("Error searching account:", error)
      showAlert("검색 오류", "은행 또는 계좌번호를 다시 확인해주세요.")
      setRecipientName("")
      setSenderMemo("") // 내 통장 표시 초기화 추가
    } finally {
      setIsSearching(false)
    }
  }

  // 금액 입력 시 천 단위 콤마 추가 및 한글 단위 변환
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "")

    // 100억 이상이면 입력 제한
    if (value && Number.parseInt(value) >= 10000000000) {
      showAlert("입력 오류", "최대 입력 가능 금액은 100억 미만입니다.")
      return
    }

    const formattedValue = value ? Number.parseInt(value).toLocaleString() : ""
    setAmount(formattedValue)
    setAmountInKorean(formatAmountWithKoreanUnit(value))
  }

  // 모든 입력값 초기화 함수 수정:
  const resetAllInputs = () => {
    setSelectedBank("")
    setAccountNumber("")
    setAmount("")
    setAmountInKorean("")
    setRecipientMemo("")
    setSenderMemo("")
    setRecipientName("")
    setShowAccountModal(false)
    setShowTransferModal(false)
  }

  // 모달 닫기 함수 변경
  const handleCloseAccountModal = () => {
    setShowAccountModal(false)
  }

  // 이체 확인 모달 표시 함수 추가
  const handleShowTransferModal = () => {
    setShowTransferModal(true)
  }

  // 이체 확인 모달 닫기 함수 추가
  const handleCloseTransferModal = () => {
    setShowTransferModal(false)
  }

  const formatBalance = (balance) => {
    return balance?.toLocaleString() || "0"
  }

  // 알림 모달 컴포넌트
  const AlertModal = () => {
    if (!showAlertModal) return null

    const handleClose = () => {
      setShowAlertModal(false)
      if (alertCallback) {
        alertCallback()
      }
    }

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>{alertTitle}</h3>
          <p className={styles.modalMessage}>{alertMessage}</p>
          <button className={styles.modalButton} onClick={handleClose}>
            확인
          </button>
        </div>
      </div>
    )
  }

  // 모달 컴포넌트 수정 - 이름 변경
  const AccountConfirmModal = () => {
    if (!showAccountModal) return null

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>계좌 확인</h3>
          <p className={styles.modalMessage}>
            <span className={styles.highlightText}>{recipientName}</span>님의 계좌가 확인되었습니다.
          </p>
          <p className={styles.modalSubMessage}>내 통장 표시에 수취인 이름이 입력되었습니다.</p>
          <button className={styles.modalButton} onClick={handleCloseAccountModal}>
            확인
          </button>
        </div>
      </div>
    )
  }

  // 이체 확인 모달 컴포넌트 추가
  const TransferConfirmModal = () => {
    const [modalPassword, setModalPassword] = useState("")
    const [modalResetPassword, setModalResetPassword] = useState(false)
    const [isPasswordVerified, setIsPasswordVerified] = useState(false)
    const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false)
    const [modalAlertTitle, setModalAlertTitle] = useState("")
    const [modalAlertMessage, setModalAlertMessage] = useState("")
    const [modalAlertCallback, setModalAlertCallback] = useState(null)
    const [showModalAlertModal, setShowModalAlertModal] = useState(false)

    if (!showTransferModal) return null

    const showModalAlert = (title, message, callback = null) => {
      setModalAlertTitle(title)
      setModalAlertMessage(message)
      setModalAlertCallback(callback)
      setShowModalAlertModal(true)
    }

    const handleModalPasswordComplete = (value) => {
      setModalPassword(value)
      // 비밀번호가 변경되면 검증 상태를 초기화
      if (isPasswordVerified) {
        setIsPasswordVerified(false)
      }
    }

    const verifyPassword = async (accountId, password) => {
      try {
        const response = await fetch(`${API_URL}/api/accounts/verify-password`, {
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
        showModalAlert("입력 오류", "비밀번호를 입력해주세요.")
        return
      }

      // 비밀번호 검증
      const isValid = await verifyPassword(selectedAccount.accountId, modalPassword)

      if (isValid) {
        setIsPasswordVerified(true)
        setShowPasswordSuccessModal(true)
      } else {
        showModalAlert("비밀번호 오류", "비밀번호가 일치하지 않습니다.")
        setModalPassword("")
        setModalResetPassword((prev) => !prev)
      }
    }

    const handleModalSubmit = async () => {
      try {
        const response = await fetch(`${API_URL}/api/transfers?memberId=${memberId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAccountId: selectedAccount.accountId,
            toBankName: selectedBank,
            toAccountNumber: accountNumber,
            amount: Number(amount.replace(/,/g, "")),
            password: modalPassword,
            senderName: recipientMemo,
            receiverName: senderMemo,
          }),
        })

        if (!response.ok) {
          throw new Error("이체에 실패했습니다.")
        }

        showModalAlert("이체 완료", "이체가 성공적으로 완료되었습니다.", () => {
          handleCloseTransferModal()
          resetAllInputs() // 성공 시 모든 입력값 초기화
        })
      } catch (error) {
        console.error("Error during transfer:", error)
        showModalAlert("이체 오류", "이체 중 오류가 발생했습니다. 다시 시도해주세요.")
        setModalPassword("")
        setModalResetPassword((prev) => !prev)
        setIsPasswordVerified(false)
      }
    }

    const PasswordSuccessModal = () => {
      if (!showPasswordSuccessModal) return null

      return (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: "300px" }}>
            <h3 className={styles.modalTitle}>비밀번호 확인</h3>
            <p className={styles.modalMessage}>비밀번호가 확인되었습니다.</p>
            <button className={styles.modalButton} onClick={() => setShowPasswordSuccessModal(false)}>
              확인
            </button>
          </div>
        </div>
      )
    }

    const ModalAlertModal = () => {
      if (!showModalAlertModal) return null

      const handleClose = () => {
        setShowModalAlertModal(false)
        if (modalAlertCallback) {
          modalAlertCallback()
        }
      }

      return (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{modalAlertTitle}</h3>
            <p className={styles.modalMessage}>{modalAlertMessage}</p>
            <button className={styles.modalButton} onClick={handleClose}>
              확인
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>이체 확인</h3>
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
            {recipientMemo && (
              <div className={styles.modalInfoItem}>
                <span className={styles.modalLabel}>받는분 통장 표시</span>
                <span className={styles.modalValue}>{recipientMemo}</span>
              </div>
            )}
            {senderMemo && (
              <div className={styles.modalInfoItem}>
                <span className={styles.modalLabel}>내 통장 표시</span>
                <span className={styles.modalValue}>{senderMemo}</span>
              </div>
            )}
          </div>

          <div className={styles.modalPasswordSection}>
            <label className={styles.modalLabel}>비밀번호</label>
            {isPasswordVerified ? (
              <div className={styles.verifiedPasswordDisplay}>
                <div className={styles.passwordDots}>{Array(modalPassword.length).fill("●").join("")}</div>
                <div className={styles.passwordVerifiedMessage}>비밀번호 확인 완료</div>
              </div>
            ) : (
              <div style={{ position: "relative", zIndex: 20 }}>
                <PasswordInputKeypad onPasswordComplete={handleModalPasswordComplete} reset={modalResetPassword} />
                <button
                  className={styles.modalVerifyButton}
                  onClick={handlePasswordVerification}
                  disabled={!modalPassword}
                >
                  비밀번호 확인
                </button>
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.modalCancelButton}
              onClick={() => {
                handleCloseTransferModal()
                setModalPassword("")
                setModalResetPassword((prev) => !prev)
                setIsPasswordVerified(false)
                setShowPasswordSuccessModal(false)
              }}
            >
              취소
            </button>
            <button className={styles.modalSubmitButton} onClick={handleModalSubmit} disabled={!isPasswordVerified}>
              이체
            </button>
          </div>
        </div>
        <PasswordSuccessModal />
        <ModalAlertModal />
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
      <div className="content-container">
        <div className="page-header">
          <h2 className="page-title">이체정보 입력</h2>
        </div>

        <div className={styles.transferFormContainer}>
          {/* 출금계좌 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>출금계좌</label>
            <div className={styles.accountSelectWrapper}>
              <select
                className={`${styles.formSelect} ${styles.fullWidthSelect}`}
                value={selectedAccount?.accountId || ""}
                onChange={(e) => {
                  const selected = accounts.find((acc) => acc.accountId === Number.parseInt(e.target.value))
                  setSelectedAccount(selected)
                  if (selected) {
                    setRecipientMemo(selected.senderName || selected.accountHolder || "")
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
              {selectedAccount && (
                <div className={styles.accountBalance}>
                  출금가능금액 {formatBalance(selectedAccount?.balance || 0)}원
                </div>
              )}
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
            {amountInKorean && ( // 수정된 부분
              <div className={styles.amountInKorean}>{amountInKorean}</div>
            )}
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

          {/* 이체 버튼 */}
          <button
            className={styles.transferButton}
            onClick={handleShowTransferModal}
            disabled={!selectedAccount || !selectedBank || !accountNumber || !amount || !recipientName}
          >
            확인
          </button>
        </div>
      </div>
      <AccountConfirmModal />
      <TransferConfirmModal />
      <AlertModal />
    </main>
  )
}

