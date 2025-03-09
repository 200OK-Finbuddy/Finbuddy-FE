"use client"

import API_URL from "../config"
import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import styles from "../styles/Transactions.module.css"
import AccountExpenseChart from "./AccountExpenseChart"
import { BANKS } from "../constants/banks"

export default function Transactions() {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountDetails, setAccountDetails] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [transactions, setTransactions] = useState([])
  const observer = useRef()
  const memberId = 4 // 실제 구현시 로그인한 사용자 ID를 사용
  const location = useLocation()
  const navigate = useNavigate() // 추가: 송금 페이지로 이동하기 위한 navigate

  // URL에서 accountId 파라미터 가져오기
  const getAccountIdFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get("accountId")
  }, [location.search])

  // 은행 ID로 은행 이름 찾기
  const getBankNameById = (bankId) => {
    const bank = BANKS.find((bank) => bank.id === bankId)
    return bank ? bank.name : "알 수 없는 은행"
  }

  const getAccountTypeText = (type) => {
    switch (type) {
      case "CHECKING":
        return "입/출금"
      case "SAVING":
        return "적금"
      case "DEPOSIT":
        return "예금"
      default:
        return type
    }
  }

  // 무한스크롤을 위한 ref 콜백
  const lastTransactionElementRef = useCallback(
    (node) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore],
  )

  // monthOptions 생성 부분 수정
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      value: date.getMonth() + 1,
      year: date.getFullYear(),
      label: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`, // 월을 2자리 숫자로 포맷팅
    }
  }).reverse()

  // 월간 거래 요약 상태 추가
  const [monthlySummary, setMonthlySummary] = useState({
    depositTotal: 0,
    withdrawalTotal: 0,
  })

  // 날짜 필터 상태 추가
  // 거래내역 테이블을 위한 독립적인 상태들
  const [transactionFilters, setTransactionFilters] = useState({
    startDate: null,
    endDate: null,
    type: "all",
    sortDirection: "DESC",
  })

  // 월간 거래 요약을 위한 독립적인 상태
  const [summaryMonth, setSummaryMonth] = useState(monthOptions[monthOptions.length - 1])

  // 계좌 목록 조회
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accounts/all/${memberId}`)
        if (!response.ok) throw new Error("Failed to fetch accounts")
        const data = await response.json()
        setAccounts(data || [])

        // URL에서 accountId 파라미터 가져오기
        const accountIdFromUrl = getAccountIdFromUrl()

        if (accountIdFromUrl && data && data.length > 0) {
          // URL에 accountId가 있으면 해당 계좌 선택
          const accountFromUrl = data.find((acc) => acc.accountId.toString() === accountIdFromUrl)
          if (accountFromUrl) {
            setSelectedAccount(accountFromUrl)
            const index = data.findIndex((acc) => acc.accountId.toString() === accountIdFromUrl)
            if (index !== -1) {
              setCurrentIndex(index)
            }
          } else {
            // 해당 계좌가 없으면 첫 번째 계좌 선택
            setSelectedAccount(data[0])
          }
        } else if (data && data.length > 0) {
          // URL에 accountId가 없으면 첫 번째 계좌 선택
          setSelectedAccount(data[0])
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching accounts:", error)
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [memberId, getAccountIdFromUrl])

  // 계좌 상세 정보 조회
  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!selectedAccount) return

      try {
        const response = await fetch(`${API_URL}/api/accounts/${selectedAccount.accountId}?memberId=${memberId}`)
        if (!response.ok) throw new Error("Failed to fetch account details")
        const data = await response.json()
        setAccountDetails(data)
      } catch (error) {
        console.error("Error fetching account details:", error)
      }
    }

    fetchAccountDetails()
  }, [selectedAccount, memberId])

  // 월간 거래 요약 데이터를 가져오는 함수 추가
  const fetchMonthlySummary = useCallback(async () => {
    if (!selectedAccount) return

    try {
      const response = await fetch(
        `${API_URL}/api/transactions/account/monthly-summary?memberId=${memberId}&accountId=${selectedAccount.accountId}&year=${summaryMonth.year}&month=${summaryMonth.value}`,
      )

      if (!response.ok) throw new Error("Failed to fetch monthly summary")
      const data = await response.json()
      setMonthlySummary(data)
    } catch (error) {
      console.error("Error fetching monthly summary:", error)
      setMonthlySummary({ depositTotal: 0, withdrawalTotal: 0 })
    }
  }, [selectedAccount, summaryMonth, memberId])

  // selectedAccount나 selectedMonth가 변경될 때마다 월간 거래 요약 조회
  useEffect(() => {
    fetchMonthlySummary()
  }, [fetchMonthlySummary])

  // 거래내역 조회 - 페이지네이션 추가
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedAccount) return

      try {
        const transactionType =
          transactionFilters.type === "income" ? 1 : transactionFilters.type === "expense" ? 2 : null

        // URL 파라미터 구성
        const params = new URLSearchParams({
          memberId: memberId.toString(),
          page: page.toString(),
          size: "20",
          sort: `transactionDate,${transactionFilters.sortDirection.toLowerCase()}`,
        })

        // 거래 유형이 있는 경우 추가
        if (transactionType) {
          params.append("transactionType", transactionType.toString())
        }

        // 날짜 필터가 있는 경우 추가
        if (transactionFilters.startDate) {
          params.append("startDate", transactionFilters.startDate)
        }
        if (transactionFilters.endDate) {
          params.append("endDate", transactionFilters.endDate)
        }

        const response = await fetch(
          `${API_URL}/api/transactions/account/${selectedAccount.accountId}?${params.toString()}`,
        )

        if (!response.ok) throw new Error("Failed to fetch transactions")
        const data = await response.json()

        setTransactions((prev) => (page === 0 ? data.content : [...prev, ...data.content]))
        setHasMore(!data.last)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setTransactions([])
        setMonthlySummary({ depositTotal: 0, withdrawalTotal: 0 })
      }
    }

    fetchTransactions()
  }, [selectedAccount, page, transactionFilters, memberId])

  const handleNext = () => {
    if (accounts.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % accounts.length)
    setSelectedAccount(accounts[(currentIndex + 1) % accounts.length])
  }

  const handlePrev = () => {
    if (accounts.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? accounts.length - 1 : prevIndex - 1))
    setSelectedAccount(accounts[currentIndex === 0 ? accounts.length - 1 : currentIndex - 1])
  }

  // 계좌 선택 시 거래내역 초기화 문제 해결
  // handleAccountClick 함수 수정
  const handleAccountClick = (account) => {
    if (selectedAccount?.accountId !== account.accountId) {
      setSelectedAccount(account)
      setTransactions([]) // 거래내역 초기화
      setPage(0) // 페이지 초기화
      const newIndex = accounts.findIndex((acc) => acc.accountId === account.accountId)
      if (newIndex !== -1) {
        setCurrentIndex(newIndex)
      }

      // URL 업데이트 (선택적)
      window.history.replaceState(null, "", `/transactions?accountId=${account.accountId}`)
    }
  }

  // 송금 버튼 클릭 핸들러 추가
  const handleTransferClick = (e, accountId) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지
    navigate(`/transfer?accountId=${accountId}`)
  }

  const formatAmount = (amount) => {
    return amount?.toLocaleString() || "0"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatTransactionAmount = (amount, type) => {
    const formattedAmount = formatAmount(Math.abs(amount))
    return type === 1 ? `+${formattedAmount}` : `-${formattedAmount}`
  }

  const getAmountClass = (type) => {
    return type === 1 ? styles.income : styles.expense
  }

  const visibleAccounts = accounts.length
    ? [
        { ...accounts[currentIndex], position: "current" },
        { ...accounts[(currentIndex + 1) % accounts.length], position: "next" },
        { ...accounts[(currentIndex + 2) % accounts.length], position: "nextNext" },
      ].filter(Boolean)
    : []

  // 계좌 상세 정보 조회 - 예/적금 정보 표시 추가
  const renderAccountInfo = () => {
    if (!accountDetails) return null

    return (
      <div className={styles.infoContent}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>계좌종류</span>
          <span className={styles.infoValue}>{getAccountTypeText(accountDetails.accountType)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>개설일</span>
          <span className={styles.infoValue}>
            {accountDetails.createdAt ? new Date(accountDetails.createdAt).toLocaleDateString() : "-"}
          </span>
        </div>
        {accountDetails.maturedAt && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>만기일</span>
            <span className={styles.infoValue}>{new Date(accountDetails.maturedAt).toLocaleDateString()}</span>
          </div>
        )}
        {accountDetails.interestRate && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>금리</span>
            <span className={styles.infoValue}>{accountDetails.interestRate}%</span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>계좌번호</span>
          <span className={styles.infoValue}>{accountDetails.accountNumber}</span>
        </div>
      </div>
    )
  }

  // 거래내역 필터 컴포넌트 추가
  const renderTransactionFilters = () => (
    <div className={styles.transactionFilters}>
      <div className={styles.dateFilters}>
        <input
          type="date"
          value={transactionFilters.startDate || ""}
          onChange={(e) => handleDateFilterChange(e.target.value, transactionFilters.endDate)}
          className={styles.dateInput}
        />
        <span>~</span>
        <input
          type="date"
          value={transactionFilters.endDate || ""}
          onChange={(e) => handleDateFilterChange(transactionFilters.startDate, e.target.value)}
          className={styles.dateInput}
        />
      </div>
      <button className={styles.sortButton} onClick={handleSortDirectionChange}>
        {transactionFilters.sortDirection === "DESC" ? "최신순" : "과거순"}
      </button>
    </div>
  )

  const handleTransactionFilterChange = (type) => {
    setTransactionFilters((prev) => ({
      ...prev,
      type,
    }))
    setPage(0)
    setTransactions([])
  }

  const handleSortDirectionChange = () => {
    setTransactionFilters((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === "DESC" ? "ASC" : "DESC",
    }))
    setPage(0)
    setTransactions([])
  }

  const handleDateFilterChange = (startDate, endDate) => {
    setTransactionFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }))
    setPage(0)
    setTransactions([])
  }

  useEffect(() => {
    // 계좌가 변경될 때마다 거래내역과 페이지 초기화
    setTransactions([])
    setPage(0)
  }, [selectedAccount])

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

  if (accounts.length === 0) {
    return (
      <main className="main-content">
        <div className={styles.noAccountsMessage}>등록된 계좌가 없습니다.</div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="content-container">
        <div className="page-header">
          <h2 className="page-title">거래내역</h2>
        </div>

        {/* 계좌 카드 캐러셀 */}
        <div className={styles.accountCarouselWrapper}>
          <button
            className={`${styles.carouselButton} ${styles.prev}`}
            onClick={handlePrev}
            aria-label="이전 계좌"
            disabled={accounts.length <= 1}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className={styles.accountCards}>
            {visibleAccounts.map((account) => (
              <div
                key={`${account.accountId}-${account.position}`}
                className={`${styles.accountCard} ${
                  selectedAccount?.accountId === account.accountId ? styles.active : ""
                }`}
                onClick={() => handleAccountClick(account)}
              >
                <div className={styles.bankInfo}>
                  <img
                    src={account.bankLogoUrl || "/placeholder.svg"}
                    alt={`${account.bankName} 로고`}
                    className={styles.bankLogo}
                  />
                  <div className={styles.accountInfo}>
                    <h3 className={styles.accountName}>{account.accountName}</h3>
                    <p className={styles.accountNumber}>{account.accountNumber}</p>
                  </div>
                </div>
                <div className={styles.accountBalance}>{formatAmount(account.balance)}원</div>

                {accountDetails.accountType === "CHECKING" && (
                  <button className={styles.transferButton} onClick={(e) => handleTransferClick(e, account.accountId)}>
                    송금하기
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className={`${styles.carouselButton} ${styles.next}`}
            onClick={handleNext}
            aria-label="다음 계좌"
            disabled={accounts.length <= 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {selectedAccount && accountDetails && (
          <div className={styles.accountDetailContainer}>
            <div className={styles.accountDetailHeader}>
              <div className={styles.bankInfoHeader}>
                <img
                  src={accountDetails.logoUrl || "/placeholder.svg"}
                  alt={`${getBankNameById(accountDetails.bankId)} 로고`}
                  className={styles.bankLogoHeader}
                />
                <span className={styles.bankNameHeader}>{getBankNameById(accountDetails.bankId)}</span>
              </div>
              <h2 className={styles.accountTitle}>{accountDetails.accountName}</h2>
              <p className={styles.accountNumberDetail}>{accountDetails.accountNumber}</p>
            </div>

            <div className={styles.accountInfoGrid}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>계좌 정보</h3>
                {renderAccountInfo()}
              </div>

              {/* 월간 거래 요약 부분 */}
              <div className={styles.monthlySummaryCard}>
                <div className={styles.summaryHeader}>
                  <h3 className={styles.infoTitle}>월간 거래 요약</h3>
                  <select
                    className={styles.monthSelect}
                    value={JSON.stringify(summaryMonth)}
                    onChange={(e) => {
                      setSummaryMonth(JSON.parse(e.target.value))
                    }}
                  >
                    {monthOptions.map((month) => (
                      <option key={`${month.year}-${month.value}`} value={JSON.stringify(month)}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.summaryCharts}>
                  <div className={styles.horizontalBarChart}>
                    <div className={styles.chartLabel}>
                      <span>입금</span>
                      <span>{formatAmount(monthlySummary.depositTotal)}원</span>
                    </div>
                    <div className={styles.barWrapper}>
                      <div
                        className={`${styles.bar} ${styles.incomeBar}`}
                        style={{
                          width:
                            monthlySummary.depositTotal === 0 && monthlySummary.withdrawalTotal === 0
                              ? "1%" // 0원일 때 1%로 수정
                              : `${(monthlySummary.depositTotal / Math.max(monthlySummary.depositTotal + monthlySummary.withdrawalTotal, 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className={styles.chartLabel}>
                      <span>출금</span>
                      <span>{formatAmount(monthlySummary.withdrawalTotal)}원</span>
                    </div>
                    <div className={styles.barWrapper}>
                      <div
                        className={`${styles.bar} ${styles.expenseBar}`}
                        style={{
                          width:
                            monthlySummary.withdrawalTotal === 0 && monthlySummary.depositTotal === 0
                              ? "1%" // 0원일 때 1%로 수정
                              : `${(monthlySummary.withdrawalTotal / Math.max(monthlySummary.depositTotal + monthlySummary.withdrawalTotal, 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AccountExpenseChart를 독립적으로 렌더링 */}
            <AccountExpenseChart
              accountId={selectedAccount.accountId}
              memberId={memberId}
              accountType={accountDetails.accountType}
              key={`expense-chart-${selectedAccount.accountId}`}
            />

            {/* 거래내역 테이블 */}
            <div className={styles.transactionsContainer}>
              <div className={styles.transactionsHeader}>
                <h3 className={styles.transactionsTitle}>최근 거래내역</h3>
                {renderTransactionFilters()}
                <div className={styles.transactionTabs}>
                  <button
                    className={`${styles.tabButton} ${transactionFilters.type === "all" ? styles.active : ""}`}
                    onClick={() => handleTransactionFilterChange("all")}
                  >
                    전체
                  </button>
                  <button
                    className={`${styles.tabButton} ${transactionFilters.type === "income" ? styles.active : ""}`}
                    onClick={() => handleTransactionFilterChange("income")}
                  >
                    입금
                  </button>
                  <button
                    className={`${styles.tabButton} ${transactionFilters.type === "expense" ? styles.active : ""}`}
                    onClick={() => handleTransactionFilterChange("expense")}
                  >
                    출금
                  </button>
                </div>
              </div>

              <div className={styles.transactionsTableContainer}>
                <table className={styles.transactionsTable}>
                  <thead>
                    <tr>
                      <th>거래처</th>
                      <th>거래 유형</th>
                      <th>거래 날짜</th>
                      <th>금액</th>
                      <th>잔액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((transaction, index) => (
                        <tr
                          key={`${selectedAccount?.accountId}-${transaction.transactionId}-${index}`}
                          ref={index === transactions.length - 1 ? lastTransactionElementRef : null}
                        >
                          <td>{transaction.opponentName}</td>
                          <td>{transaction.transactionType === 1 ? "입금" : "출금"}</td>
                          <td>{formatDate(transaction.transactionDate)}</td>
                          <td className={getAmountClass(transaction.transactionType)}>
                            {formatTransactionAmount(transaction.amount, transaction.transactionType)}원
                          </td>
                          <td>{formatAmount(transaction.updatedBalance)}원</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className={styles.noData}>
                          거래내역이 없습니다.
                        </td>
                      </tr>
                    )}
                    {hasMore && (
                      <tr>
                        <td colSpan="5" className={styles.loadingMore}>
                          데이터를 불러오는 중입니다...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

