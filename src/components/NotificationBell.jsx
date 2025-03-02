"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import styles from "../styles/NotificationBell.module.css"
import { useNotification } from "./NotificationProvider"

export default function NotificationBell() {
  // SSE 구독과 알림 관리는 NotificationProvider로 이동했으므로,
  // 여기에서는 Context에서 필요한 값과 메서드만 가져옵니다.
  const { notifications, unreadCount, markAsRead, deleteNotification, deleteAllNotifications } = useNotification()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins}분 전`
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString()
    }
  }

  // 알림 타입에 따른 아이콘 및 스타일
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case "TRANSFER":
        return { icon: "💸", className: "transfer" }
      case "ACCOUNT":
        return { icon: "🏦", className: "account" }
      case "BUDGET":
        return { icon: "💰", className: "budget" }
      default:
        return { icon: "📌", className: "default" }
    }
  }

  return (
    <div className={styles.notificationBellContainer} ref={dropdownRef}>
      <button className={styles.notificationBellButton} onClick={() => setIsOpen(!isOpen)} aria-label="알림">
        <Bell size={20} />
        {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.notificationDropdown}>
          <div className={styles.notificationHeader}>
            <h3>알림</h3>
            {notifications.length > 0 && (
              <button className={styles.clearAllButton} onClick={deleteAllNotifications}>
                모두 삭제
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyNotification}>알림이 없습니다.</div>
            ) : (
              notifications.map((notification) => {
                const typeInfo = getNotificationTypeInfo(notification.notificationType)
                return (
                  <div
                    key={notification.notificationId}
                    className={`
                      ${styles.notificationItem} 
                      ${!notification.isRead ? styles.unread : ""} 
                      ${styles[typeInfo.className]}
                    `}
                  >
                    <div className={styles.notificationIcon}>{typeInfo.icon}</div>
                    <div className={styles.notificationContent}>
                      <p>{notification.content}</p>
                      <span className={styles.notificationTime}>{formatDate(notification.createdAt)}</span>
                    </div>
                    <div className={styles.notificationActions}>
                      {!notification.isRead && (
                        <button
                          className={styles.readBtn}
                          onClick={() => markAsRead(notification.notificationId)}
                          aria-label="읽음 표시"
                        >
                          읽음
                        </button>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteNotification(notification.notificationId)}
                        aria-label="삭제"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
