"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import styles from "../styles/Budget.module.css"
import BudgetTransactions from "./BudgetTransactions"

export default function Budget() {
  const navigate = useNavigate()
  const [budget, setBudget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newAmount, setNewAmount] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState(null)
  const memberId = 1 // 실제 구현시 로그인한 사용자 ID를 사용

  // 현재 월 예산 조회
  const fetchCurrentBudget = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/budgets/current?memberId=${memberId}`)

      if (response.status === 404) {
        // 예산이 없는 경우
        setBudget(null)
        return
      }

      if (!response.ok) {
        throw new Error("예산 정보를 불러오는데 실패했습니다.")
      }

      const data = await response.json()

      // API 응답 필드명과 프론트엔드가 사용하는 필드명 매핑
      setBudget({
        budgetId: data.id,
        budgetAmount: data.amount,
        spentAmount: data.spentAmount,
        startDate: data.startDate,
        endDate: data.endDate,
      })
    } catch (error) {
      console.error("Error fetching budget:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentBudget()
  }, [])

  // 예산 생성
  const createBudget = async (amount) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/budgets?memberId=${memberId}&amount=${amount}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "예산 생성에 실패했습니다.")
      }

      await fetchCurrentBudget()
      setIsEditing(false)
    } catch (error) {
      console.error("Error creating budget:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 예산 수정
  const updateBudget = async () => {
    if (!budget || !newAmount) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/budgets/${budget.budgetId}?memberId=${memberId}&newAmount=${newAmount}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "예산 수정에 실패했습니다.")
      }

      await fetchCurrentBudget()
      setIsEditing(false)
      setNewAmount("")
    } catch (error) {
      console.error("Error updating budget:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 예산 삭제
  const deleteBudget = async () => {
    if (!budget) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/budgets/${budget.budgetId}?memberId=${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "예산 삭제에 실패했습니다.")
      }

      setBudget(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Error deleting budget:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 금액 입력 처리 (숫자만 입력 가능하도록)
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    setNewAmount(value)
  }

  // 금액 포맷팅 (천 단위 콤마 추가)
  const formatAmount = (amount) => {
    return Number(amount)?.toLocaleString() || "0"
  }

  // 예산 생성 폼 제출
  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!newAmount) return
    createBudget(newAmount)
  }

  // 예산 수정 폼 제출
  const handleUpdateSubmit = (e) => {
    e.preventDefault()
    updateBudget()
  }

  // 현재 월 표시
  const getCurrentMonth = () => {
    const date = new Date()
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  // 진행률 계산 (API에서 사용한 금액 정보가 오는 경우)
  const calculateProgress = () => {
    if (!budget) return 0
    return Math.min(100, Math.round((budget.spentAmount / budget.budgetAmount) * 100))
  }

  // 남은 금액 계산
  const calculateRemaining = () => {
    if (!budget) return 0
    return Math.max(0, budget.budgetAmount - budget.spentAmount)
  }

  return (
    <main className="main-content">
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>
      <div className="content-container">
        <div className="page-header">
          <div className={styles.headerWithBack}>
            <button className={styles.backButton} onClick={() => navigate("/settings")}>
              <ArrowLeft size={20} />
            </button>
            <h2 className="page-title">예산 관리</h2>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button className={styles.dismissButton} onClick={() => setError(null)} aria-label="에러 메시지 닫기">
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>정보를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className={styles.budgetContainer}>
            {budget ? (
              <>
                {isEditing ? (
                  <div className={styles.budgetForm}>
                    <h3 className={styles.formTitle}>예산 수정</h3>
                    <form onSubmit={handleUpdateSubmit}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>예산 금액</label>
                        <div className={styles.amountInputWrapper}>
                          <input
                            type="text"
                            className={styles.amountInput}
                            value={newAmount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            autoFocus
                          />
                          <span className={styles.currencyUnit}>원</span>
                        </div>
                        {newAmount && <div className={styles.amountPreview}>{formatAmount(newAmount)}원</div>}
                      </div>
                      <div className={styles.formActions}>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => {
                            setIsEditing(false)
                            setNewAmount("")
                          }}
                        >
                          취소
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={!newAmount}>
                          저장
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className={styles.budgetCard}>
                    <div className={styles.budgetHeader}>
                      <h3 className={styles.budgetTitle}>{getCurrentMonth()} 예산</h3>
                      {!isEditing && (
                        <div className={styles.headerActions}>
                          <button
                            className={styles.editButton}
                            onClick={() => {
                              setIsEditing(true)
                              setNewAmount(budget.budgetAmount.toString())
                            }}
                          >
                            <Edit2 size={18} />
                            <span>수정</span>
                          </button>
                          <button className={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
                            <Trash2 size={18} />
                            <span>삭제</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.budgetAmount}>
                      <span className={styles.amountValue}>{formatAmount(budget.budgetAmount)}</span>
                      <span className={styles.amountUnit}>원</span>
                    </div>
                    <div className={styles.budgetProgress}>
                      <div className={styles.progressInfo}>
                        <span>사용 금액: {formatAmount(budget.spentAmount)}원</span>
                        <span>{calculateProgress()}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${calculateProgress()}%` }}></div>
                      </div>
                    </div>
                    <div className={styles.budgetRemaining}>
                      <span className={styles.remainingLabel}>남은 금액</span>
                      <span className={styles.remainingValue}>{formatAmount(calculateRemaining())}원</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noBudget}>
                <div className={styles.noBudgetMessage}>
                  <h3>{getCurrentMonth()} 예산이 설정되지 않았습니다.</h3>
                  <p>지출 관리를 위해 월별 예산을 설정해보세요.</p>
                </div>
                {isEditing ? (
                  <div className={styles.setupForm}>
                    <form onSubmit={handleCreateSubmit}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>예산 금액을 입력해주세요</label>
                        <div className={styles.amountInputWrapper}>
                          <input
                            type="text"
                            className={styles.amountInput}
                            value={newAmount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            autoFocus
                          />
                          <span className={styles.currencyUnit}>원</span>
                        </div>
                        {newAmount && <div className={styles.amountPreview}>{formatAmount(newAmount)}원</div>}
                      </div>
                      <div className={styles.formActions}>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => {
                            setIsEditing(false)
                            setNewAmount("")
                          }}
                        >
                          취소
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={!newAmount}>
                          저장
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    className={styles.createBudgetButton}
                    onClick={() => {
                      setIsEditing(true)
                      setNewAmount("")
                    }}
                  >
                    예산 설정하기
                  </button>
                )}
              </div>
            )}
            {/* Add the budget transactions section */}
            {!isLoading && !isEditing && (
              <div className={styles.transactionsSection}>
                <BudgetTransactions />
              </div>
            )}
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>예산 삭제</h3>
              <p className={styles.modalMessage}>{getCurrentMonth()} 예산을 삭제하시겠습니까?</p>
              <div className={styles.modalActions}>
                <button className={styles.modalCancelButton} onClick={() => setShowDeleteConfirm(false)}>
                  취소
                </button>
                <button className={styles.modalDeleteButton} onClick={deleteBudget}>
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

