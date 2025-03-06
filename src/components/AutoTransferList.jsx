"use client"

import API_URL from "../config"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import styles from "../styles/AutoTransfer.module.css"

export default function AutoTransferList() {
  const [autoTransfers, setAutoTransfers] = useState([])
  const navigate = useNavigate()
  const memberId = 4 // 실제 구현시 로그인한 사용자 ID를 사용
  // 상태 변수 추가 (useState 부분 근처에 추가)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [transferToDelete, setTransferToDelete] = useState(null)

  useEffect(() => {
    fetchAutoTransfers()
  }, [])

  const fetchAutoTransfers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/autotransfer/list/${memberId}`)
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      console.log(data)
      setAutoTransfers(data)
    } catch (error) {
      console.error("Error fetching auto transfers:", error)
    }
  }

  // handleDelete 함수 수정
  const handleDelete = (id) => {
    setTransferToDelete(id)
    setShowDeleteConfirmModal(true)
  }

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/autotransfer/${id}/toggle-status`, {
        method: "PATCH",
      })
      if (!response.ok) throw new Error("Failed to toggle status")
      fetchAutoTransfers() // 목록 새로고침
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  // 실제 삭제 처리 함수 추가
  const confirmDelete = async () => {
    if (!transferToDelete) return

    try {
      const response = await fetch(`${API_URL}/api/autotransfer/${transferToDelete}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete")
      fetchAutoTransfers() // 목록 새로고침
    } catch (error) {
      console.error("Error deleting auto transfer:", error)
    } finally {
      setShowDeleteConfirmModal(false)
      setTransferToDelete(null)
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount)
  }

  // DeleteConfirmModal 컴포넌트 추가 (return 문 바로 위에 추가)
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirmModal) return null

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>자동이체 삭제</h3>
          <p className={styles.modalMessage}>자동이체를 삭제하시겠습니까?</p>
          <div className={styles.modalActions}>
            <button
              className={styles.modalCancelButton}
              onClick={() => {
                setShowDeleteConfirmModal(false)
                setTransferToDelete(null)
              }}
            >
              취소
            </button>
            <button className={styles.modalDeleteButton} onClick={confirmDelete}>
              삭제
            </button>
          </div>
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
          <h2 className="page-title">자동이체 관리</h2>
          <button className={styles.addButton} onClick={() => navigate("/autotransfer/create")}>
            <Plus size={20} />
            새로 만들기
          </button>
        </div>

        <div className={styles.transferList}>
          {autoTransfers.map((transfer) => (
            <div key={transfer.id} className={styles.transferItem}>
              <div className={styles.transferContent}>
                <div className={styles.transferInfo}>
                  <div className={styles.infoColumn}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>출금계좌</span>
                      <span className={styles.value}>{transfer.fromAccountNumber}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>입금계좌</span>
                      <span className={styles.value}>{transfer.targetAccountNumber}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>이체금액</span>
                      <span className={styles.value}>{formatAmount(transfer.amount)}원</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>이체일</span>
                      <span className={styles.value}>매월 {transfer.transferDay}일</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={`${styles.actionButton} ${styles.toggleButton}`}
                  onClick={() => handleToggleStatus(transfer.id)}
                  title={transfer.status === "ACTIVE" ? "비활성화" : "활성화"}
                >
                  {transfer.status === "ACTIVE" ? (
                    <ToggleRight size={24} className={styles.activeIcon} />
                  ) : (
                    <ToggleLeft size={24} className={styles.inactiveIcon} />
                  )}
                  <span>{transfer.status === "ACTIVE" ? "활성" : "비활성"}</span>
                </button>
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => navigate(`/autotransfer/edit/${transfer.id}`)}
                >
                  <Edit2 size={24} />
                  <span>수정</span>
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(transfer.id)}
                >
                  <Trash2 size={24} />
                  <span>삭제</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DeleteConfirmModal />
    </main>
  )
}

