"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import styles from "../styles/Transactions.module.css"
import AccountExpenseChart from "./AccountExpenseChart"

export default function Transactions() {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountDetails, setAccountDetails] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [transactions, setTransactions] = useState([])
  const observer = useRef()
  const memberId = 1 // 실제 구현시 로그인한 사용자 ID를 사용

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

  // selectedMonth 초기값 설정 수정
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[monthOptions.length - 1]) // 현재 달로 초기화

  // 월간 거래 요약 상태 추가
  const [monthlySummary, setMonthlySummary] = useState({
    depositTotal: 0,
    withdrawalTotal: 0,
  })

  // 날짜 필터 상태 추가
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  })

  // 정렬 상태 추가
  const [sortDirection, setSortDirection] = useState("DESC")

  // 계좌 목록 조회
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/accounts/all/${memberId}`)
        if (!response.ok) throw new Error("Failed to fetch accounts")
        const data = await response.json()
        setAccounts(data || [])
        if (data && data.length > 0) {
          setSelectedAccount(data[0])
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching accounts:", error)
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // 계좌 상세 정보 조회
  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!selectedAccount) return

      try {
        const response = await fetch(
          `http://localhost:8080/api/accounts/${selectedAccount.accountId}?memberId=${memberId}`,
        )
        if (!response.ok) throw new Error("Failed to fetch account details")
        const data = await response.json()
        setAccountDetails(data)
      } catch (error) {
        console.error("Error fetching account details:", error)
      }
    }

    fetchAccountDetails()
  }, [selectedAccount])

  // 월간 거래 요약 데이터를 가져오는 함수 추가
  const fetchMonthlySummary = useCallback(async () => {
    if (!selectedAccount) return

    try {
      const response = await fetch(
        `http://localhost:8080/api/transactions/account/monthly-summary?memberId=${memberId}&accountId=${selectedAccount.accountId}&year=${selectedMonth.year}&month=${selectedMonth.value}`,
      )

      if (!response.ok) throw new Error("Failed to fetch monthly summary")
      const data = await response.json()
      setMonthlySummary(data)
    } catch (error) {
      console.error("Error fetching monthly summary:", error)
      setMonthlySummary({ depositTotal: 0, withdrawalTotal: 0 })
    }
  }, [selectedAccount, selectedMonth, memberId])

  // selectedAccount나 selectedMonth가 변경될 때마다 월간 거래 요약 조회
  useEffect(() => {
    fetchMonthlySummary()
  }, [fetchMonthlySummary, selectedAccount, selectedMonth])

  // 거래내역 조회 - 페이지네이션 추가
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedAccount) return

      try {
        const transactionType = activeTab === "income" ? 1 : activeTab === "expense" ? 2 : null

        // URL 파라미터 구성
        const params = new URLSearchParams({
          memberId: memberId.toString(),
          page: page.toString(),
          size: "20",
          sort: `transactionDate,${sortDirection.toLowerCase()}`,
        })

        // 거래 유형이 있는 경우 추가
        if (transactionType) {
          params.append("transactionType", transactionType.toString())
        }

        // 날짜 필터가 있는 경우 추가
        if (dateFilter.startDate) {
          params.append("startDate", dateFilter.startDate)
        }
        if (dateFilter.endDate) {
          params.append("endDate", dateFilter.endDate)
        }

        const response = await fetch(
          `http://localhost:8080/api/transactions/account/${selectedAccount.accountId}?${params.toString()}`,
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
  }, [selectedAccount, page, activeTab, dateFilter, sortDirection, memberId])

  // 월간 거래 요약 데이터 계산 함수 추가
  //const calculateMonthlySummary = (transactions, year, month) => { ... } // 제거

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

  const handleAccountClick = (account) => {
    setSelectedAccount(account)
    const newIndex = accounts.findIndex((acc) => acc.accountId === account.accountId)
    if (newIndex !== -1) {
      setCurrentIndex(newIndex)
    }
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
        accounts[currentIndex],
        accounts[(currentIndex + 1) % accounts.length],
        accounts[(currentIndex + 2) % accounts.length],
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
          value={dateFilter.startDate || ""}
          onChange={(e) =>
            setDateFilter((prev) => ({
              ...prev,
              startDate: e.target.value,
            }))
          }
          className={styles.dateInput}
        />
        <span>~</span>
        <input
          type="date"
          value={dateFilter.endDate || ""}
          onChange={(e) =>
            setDateFilter((prev) => ({
              ...prev,
              endDate: e.target.value,
            }))
          }
          className={styles.dateInput}
        />
      </div>
      <button
        className={styles.sortButton}
        onClick={() => setSortDirection((prev) => (prev === "DESC" ? "ASC" : "DESC"))}
      >
        {sortDirection === "DESC" ? "최신순" : "과거순"}
      </button>
    </div>
  )

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
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>

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
                key={account.accountId}
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
                    value={JSON.stringify(selectedMonth)}
                    onChange={(e) => {
                      setSelectedMonth(JSON.parse(e.target.value))
                      setPage(0) // 월 변경 시 페이지 초기화
                      setTransactions([]) // 거래내역 초기화
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

            <AccountExpenseChart accountId={selectedAccount.accountId} memberId={memberId} />

            {/* 거래내역 테이블 */}
            <div className={styles.transactionsContainer}>
              <div className={styles.transactionsHeader}>
                <h3 className={styles.transactionsTitle}>최근 거래내역</h3>
                {renderTransactionFilters()}
                <div className={styles.transactionTabs}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "all" ? styles.active : ""}`}
                    onClick={() => {
                      setActiveTab("all")
                      setPage(0)
                      setTransactions([])
                    }}
                  >
                    전체
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "income" ? styles.active : ""}`}
                    onClick={() => {
                      setActiveTab("income")
                      setPage(0)
                      setTransactions([])
                    }}
                  >
                    입금
                  </button>
                  <button
                    className={`${styles.tabButton} ${activeTab === "expense" ? styles.active : ""}`}
                    onClick={() => {
                      setActiveTab("expense")
                      setPage(0)
                      setTransactions([])
                    }}
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
                          key={transaction.transactionId}
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

