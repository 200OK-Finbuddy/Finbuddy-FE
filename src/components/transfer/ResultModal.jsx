"use client"

import { useNavigate } from "react-router-dom" // 추가: 페이지 이동을 위한 훅
import styles from "../../styles/Transfer.module.css"

// 결과 모달 컴포넌트
const ResultModal = ({ showResultModal, resultModalType, resultModalMessage, setShowResultModal }) => {
  const navigate = useNavigate() // 추가: 페이지 이동을 위한 navigate

  if (!showResultModal) return null

  // 확인 버튼 클릭 핸들러 추가
  const handleConfirm = () => {
    setShowResultModal(false)

    // 이체 성공 시 거래내역 페이지로 이동
    if (resultModalType === "success") {
      navigate("/transactions")
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div
        className={`${styles.modalContent} ${styles[resultModalType === "success" ? "successModal" : "errorModal"]}`}
      >
        <div className={styles.resultIconContainer}>
          {resultModalType === "success" ? (
            <div className={styles.successIcon}>✓</div>
          ) : (
            <div className={styles.errorIcon}>✕</div>
          )}
        </div>
        <h3 className={styles.modalTitle}>{resultModalType === "success" ? "이체 완료" : "이체 실패"}</h3>
        <p className={styles.modalMessage}>{resultModalMessage}</p>
        <button
          className={`${styles.modalButton} ${resultModalType === "success" ? styles.successButton : styles.errorButton}`}
          onClick={handleConfirm} // 수정: 새로운 핸들러 사용
        >
          확인
        </button>
      </div>
    </div>
  )
}

export default ResultModal

