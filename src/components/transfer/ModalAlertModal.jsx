"use client"

import styles from "../../styles/Transfer.module.css"

// 모달 내 알림 모달 컴포넌트
const ModalAlertModal = ({ showModalAlertModal, modalAlertTitle, modalAlertMessage, modalAlertCallback, setShowModalAlertModal }) => {
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

export default ModalAlertModal