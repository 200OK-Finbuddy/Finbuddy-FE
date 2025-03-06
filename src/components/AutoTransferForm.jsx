"use client"

import API_URL from "../config"
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
  const memberId = 4 // 실제 구현시 로그인한 사용자의 ID를 사용

  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [selectedBank, setSelectedBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [amountInKorean, setAmountInKorean] = useState("") // 문자열로 변경
  const [recipientMemo, setRecipientMemo] = useState("")
  const [senderMemo, setSenderMemo] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [transferDay, setTransferDay] = useState("") // 추가
  const [showConfirmModal, setShowConfirmModal] = useState(false) // 추가
  const [isSearching, setIsSearching] = useState(false) // 추가
  // 상태 변수 추가 (useState 부분 근처에 추가)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertTitle, setAlertTitle] = useState("알림")
  const [alertCallback, setAlertCallback] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionMessage, setCompletionMessage] = useState("")
  const [completionTitle, setCompletionTitle] = useState("")

  // 이체일 옵션 생성 (1~31일)
  const transferDayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}일`,
  }))

  // showAlert 함수 추가 (fetchAutoTransferDetails 함수 위에 추가)
  const showAlert = (title, message, callback = null) => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertCallback(callback)
    setShowAlertModal(true)
  }

  // 계좌 목록 조회
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/transfers/all/checking-account?memberId=${memberId}`)
        if (!response.ok) throw new Error("Failed to fetch accounts")
        const data = await response.json()
        setAccounts(data)
        //setIsLoading(false)
      } catch (error) {
        console.error("Error fetching accounts:", error)
        //setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // 자동이체 상세 정보 조회
  useEffect(() => {
    const fetchAutoTransferDetails = async () => {
      if (!isEditing) return

      try {
        const response = await fetch(`${API_URL}/api/autotransfer/${id}`)
        if (!response.ok) throw new Error("Failed to fetch auto transfer details")
        const data = await response.json()

        setSelectedAccount(accounts.find((acc) => acc.accountId === data.fromAccountId))
        setSelectedBank(data.targetBankName)
        setAccountNumber(data.targetAccountNumber)
        setAmount(data.amount.toLocaleString())
        setAmountInKorean(formatAmountWithKoreanUnit(data.amount))
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

  // 계좌 검색 함수 수정 - 계좌 검색 성공 시 모달 표시 추가
  const handleAccountSearch = async (e) => {
    e.preventDefault()

    // alert 변경
    if (!selectedBank || !accountNumber) {
      showAlert("입력 오류", "은행과 계좌번호를 모두 입력해주세요.")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `${API_URL}/api/transfers/receiving-account?bankName=${selectedBank}&accountNumber=${accountNumber}`,
      )

      if (!response.ok) {
        throw new Error("계좌 검색에 실패했습니다.")
      }

      const data = await response.json()
      setRecipientName(data.receiverName)
      setSenderMemo(data.receiverName) // 내 통장 표시에 수취인 이름 설정

      // 계좌 확인 모달 표시
      showAlert(
        "계좌 확인",
        `${data.receiverName}님의 계좌가 확인되었습니다.\n내 통장 표시에 수취인 이름이 입력되었습니다.`,
      )
    } catch (error) {
      console.error("Error searching account:", error)
      // alert 변경
      showAlert("검색 오류", "은행 또는 계좌번호를 다시 확인해주세요.")
      setRecipientName("")
      setSenderMemo("")
    } finally {
      setIsSearching(false)
    }
  }

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

  // 금액 입력 시 천 단위 콤마 추가 및 한글 단위 변환
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "")

    // alert 변경
    if (value && Number.parseInt(value) >= 10000000000) {
      showAlert("입력 오류", "최대 입력 가능 금액은 100억 미만입니다.")
      return
    }

    const formattedValue = value ? Number.parseInt(value).toLocaleString() : ""
    setAmount(formattedValue)
    setAmountInKorean(formatAmountWithKoreanUnit(value))
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
    const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false)
    const [modalAlertTitle, setModalAlertTitle] = useState("")
    const [modalAlertMessage, setModalAlertMessage] = useState("")
    const [modalAlertCallback, setModalAlertCallback] = useState(null)
    const [showModalAlertModal, setShowModalAlertModal] = useState(false)

    const showModalAlert = (title, message, callback = null) => {
      setModalAlertTitle(title)
      setModalAlertMessage(message)
      setModalAlertCallback(callback)
      setShowModalAlertModal(true)
    }

    const handleModalPasswordComplete = (value) => {
      // 비밀번호 확인 버튼을 클릭했을 때만 값을 설정
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
      // alert 변경
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

    // handleModalSubmit 함수 수정 - 성공 시 완료 모달 표시 후 자동이체 리스트로 이동
    const handleModalSubmit = async () => {
      try {
        const url = isEditing ? `${API_URL}/api/autotransfer/${id}` : `${API_URL}/api/autotransfer`

        const response = await fetch(url, {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAccountId: selectedAccount.accountId,
            targetBankName: selectedBank,
            targetAccountNumber: accountNumber,
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

        // 확인 모달 닫기
        setShowConfirmModal(false)

        // 완료 모달 표시
        setCompletionTitle(isEditing ? "수정 완료" : "등록 완료")
        setCompletionMessage(
          isEditing ? "자동이체가 성공적으로 수정되었습니다." : "자동이체가 성공적으로 등록되었습니다.",
        )
        setShowCompletionModal(true)
      } catch (error) {
        console.error("Error saving auto transfer:", error)
        showModalAlert("오류", error.message)
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
              <span className={styles.modalValue}>{amountInKorean}</span> {/* 변경: 한글 금액 표시 */}
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
            {isPasswordVerified ? (
              <div className={styles.verifiedPasswordDisplay}>
                <div className={styles.passwordDots}>{Array(modalPassword.length).fill("●").join("")}</div>
                <div className={styles.passwordVerifiedMessage}>비밀번호 확인 완료</div>
              </div>
            ) : (
              <>
                <PasswordInputKeypad onPasswordComplete={handleModalPasswordComplete} reset={modalResetPassword} />
                <button
                  className={styles.modalVerifyButton}
                  onClick={handlePasswordVerification}
                  disabled={!modalPassword}
                >
                  비밀번호 확인
                </button>
              </>
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
                setShowPasswordSuccessModal(false)
              }}
            >
              취소
            </button>
            <button className={styles.modalSubmitButton} onClick={handleModalSubmit} disabled={!isPasswordVerified}>
              {isEditing ? "수정" : "등록"}
            </button>
          </div>
        </div>
        <PasswordSuccessModal />
        <ModalAlertModal />
      </div>
    )
  }

  // 완료 모달 컴포넌트 추가
  const CompletionModal = () => {
    if (!showCompletionModal) return null

    const handleClose = () => {
      setShowCompletionModal(false)
      navigate("/autotransfer") // 자동이체 리스트 페이지로 이동
    }

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>{completionTitle}</h3>
          <p className={styles.modalMessage}>{completionMessage}</p>
          <button className={styles.modalButton} onClick={handleClose}>
            확인
          </button>
        </div>
      </div>
    )
  }

  // AlertModal 컴포넌트 추가 (return 문 바로 위에 추가)
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
            {amountInKorean && <div className={styles.amountInKorean}>{amountInKorean}</div>}
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
      {showConfirmModal && <ConfirmModal />}
      <AlertModal />
      <CompletionModal />
    </main>
  )
}

