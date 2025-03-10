"use client"

import styles from "../../styles/Transfer.module.css"

// 비밀번호 성공 모달 컴포넌트
const PasswordSuccessModal = ({ showPasswordSuccessModal, setShowPasswordSuccessModal }) => {
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

export default PasswordSuccessModal