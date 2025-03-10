"use client"

import styles from "../../styles/Transfer.module.css"

// 결과 모달 컴포넌트
const ResultModal = ({ showResultModal, resultModalType, resultModalMessage, setShowResultModal }) => {
  if (!showResultModal) return null

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
          onClick={() => setShowResultModal(false)}
        >
          확인
        </button>
      </div>
    </div>
  )
}

export default ResultModal