"use client"

import API_URL from "../config"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom" // 추가: 페이지 이동을 위한 훅
import styles from "../styles/Transfer.module.css"
import { BANKS } from "../constants/banks"
import axios from "axios"

// transfer 폴더 안의 모달 컴포넌트들 가져오기
import AlertModal from "./transfer/AlertModal"
import AccountConfirmModal from "./transfer/AccountConfirmModal"
import TransferConfirmModal from "./transfer/TransferConfirmModal"
import ResultModal from "./transfer/ResultModal"

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

// Transfer 컴포넌트 내부에 navigate 선언 추가
export default function Transfer() {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [selectedBank, setSelectedBank] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [amountInKorean, setAmountInKorean] = useState("")
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
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultModalType, setResultModalType] = useState("")
  const [resultModalMessage, setResultModalMessage] = useState("")
  const navigate = useNavigate() // 추가: 페이지 이동을 위한 navigate

  // 계좌 목록 조회 - 입출금 계좌만 조회
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/transfers/all/checking-account`, {
          withCredentials: true, // 쿠키 및 인증 정보 포함
        })
                
        if (!response || response.status !== 200) {
          throw new Error(`Network response was not ok, status: ${response.status}`)
        }
        
        setAccounts(response.data)

        // Get accountId from URL if present
        const urlParams = new URLSearchParams(window.location.search)
        const accountIdFromUrl = urlParams.get("accountId")

        if (accountIdFromUrl && data.length > 0) {
          // Find the account with matching ID
          const accountFromUrl = data.find((acc) => acc.accountId.toString() === accountIdFromUrl)
          if (accountFromUrl) {
            setSelectedAccount(accountFromUrl)
            // Set recipient memo if available
            if (accountFromUrl.accountHolder || accountFromUrl.senderName) {
              setRecipientMemo(accountFromUrl.accountHolder || accountFromUrl.senderName || "")
            }
          }
        }

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
            {amountInKorean && <div className={styles.amountInKorean}>{amountInKorean}</div>}
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

      {/* 모달 컴포넌트들 */}
      <AccountConfirmModal
        showAccountModal={showAccountModal}
        recipientName={recipientName}
        handleCloseAccountModal={handleCloseAccountModal}
      />

      <TransferConfirmModal
        showTransferModal={showTransferModal}
        selectedAccount={selectedAccount}
        selectedBank={selectedBank}
        accountNumber={accountNumber}
        amount={amount}
        recipientMemo={recipientMemo}
        senderMemo={senderMemo}
        handleCloseTransferModal={handleCloseTransferModal}
        setResultModalType={setResultModalType}
        setResultModalMessage={setResultModalMessage}
        setShowResultModal={setShowResultModal}
        resetAllInputs={resetAllInputs}
      />

      <AlertModal
        showAlertModal={showAlertModal}
        alertTitle={alertTitle}
        alertMessage={alertMessage}
        alertCallback={alertCallback}
        setShowAlertModal={setShowAlertModal}
      />

      <ResultModal
        showResultModal={showResultModal}
        resultModalType={resultModalType}
        resultModalMessage={resultModalMessage}
        setShowResultModal={setShowResultModal}
      />
    </main>
  )
}

