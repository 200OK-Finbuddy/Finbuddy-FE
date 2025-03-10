"use client"

import styles from "../../styles/Transfer.module.css"

// 계좌 확인 모달 컴포넌트
const AccountConfirmModal = ({ showAccountModal, recipientName, handleCloseAccountModal }) => {
  if (!showAccountModal) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>계좌 확인</h3>
        <p className={styles.modalMessage}>
          <span className={styles.highlightText}>{recipientName}</span>님의 계좌가 확인되었습니다.
        </p>
        <p className={styles.modalSubMessage}>내 통장 표시에 수취인 이름이 입력되었습니다.</p>
        <button className={styles.modalButton} onClick={handleCloseAccountModal}>
          확인
        </button>
      </div>
    </div>
  )
}

export default AccountConfirmModal