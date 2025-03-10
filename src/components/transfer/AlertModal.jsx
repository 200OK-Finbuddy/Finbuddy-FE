"use client"

import styles from "../../styles/Transfer.module.css"

// 알림 모달 컴포넌트
const AlertModal = ({ showAlertModal, alertTitle, alertMessage, alertCallback, setShowAlertModal }) => {
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

export default AlertModal