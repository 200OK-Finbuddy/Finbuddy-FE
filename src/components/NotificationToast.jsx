"use client"

import PropTypes from "prop-types";
import { useState, useEffect } from "react"
import styles from "../styles/NotificationToast.module.css"

export default function NotificationToast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose()
      }, 300) // 300ms 애니메이션 후 제거
    }, 5000) // 5초 후 자동 닫힘

    return () => clearTimeout(timer)
  }, [onClose])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "TRANSFER":
        return "💸"
      case "AUTOTRANSFERSUCCESS":
        return "✅"
      case "AUTOTRANSFERFAIL":
        return "❌"
      case "BUDGET":
        return "💰"
      default:
        return "📌"
    }
  }

  // 타입에 따른 토스트 클래스 추가
  const getNotificationClass = (type) => {
    switch (type) {
      case "AUTOTRANSFERSUCCESS":
        return styles.successToast
      case "AUTOTRANSFERFAIL":
        return styles.failToast
      case "BUDGET":
        return styles.budgetToast
      case "TRANSFER":
        return styles.transferToast
      default:
        return ""
    }
  }

  return (
    <div className={`${styles.notificationToast} ${isVisible ? styles.visible : styles.hidden} ${getNotificationClass(notification.notificationType)}`}>
      <div className={styles.toastIcon}>{getNotificationIcon(notification.notificationType)}</div>
      <div className={styles.toastContent}>
        <div className={styles.toastTitle}>새 알림</div>
        <div className={styles.toastMessage} style={{ whiteSpace: 'pre-line' }}>{notification.content}</div>
      </div>
      <button className={styles.toastClose} onClick={() => setIsVisible(false)}>
        ×
      </button>
    </div>
  )
}

NotificationToast.propTypes = {
    notification: PropTypes.shape({
      notificationType: PropTypes.string.isRequired, // notificationType은 문자열
      content: PropTypes.string.isRequired, // content는 문자열
    }).isRequired,
    onClose: PropTypes.func.isRequired, // onClose는 함수
  }