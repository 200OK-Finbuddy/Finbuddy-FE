"use client"

import PropTypes from "prop-types"
import { createContext, useState, useContext, useEffect, useRef } from "react"
import NotificationToast from "./NotificationToast"

// 알림 컨텍스트 생성
const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  // 알림 목록
  const [notifications, setNotifications] = useState([])
  // 읽지 않은 알림 개수
  const [unreadCount, setUnreadCount] = useState(0)
  // 토스트 알림 배열
  const [toasts, setToasts] = useState([])

  // 테스트용 memberId
  const memberId = 1

  // SSE EventSource를 담을 ref
  const eventSourceRef = useRef(null)

  // 컴포넌트 마운트 시에만 실행
  useEffect(() => {
    // 처음 알림 목록 및 unreadCount 불러오기
    loadNotifications()
    updateUnreadCount()
    // SSE 연결
    setupSSE()

    // 컴포넌트 언마운트 시 연결 종료
    // unmount될 때 SSE 닫기
    return () => {
      if (eventSourceRef.current) {
        console.log("❌ SSE Connection Closed")
        eventSourceRef.current.close()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // SSE 연결 설정
  const setupSSE = () => {
    // 브라우저에서 SSE 연결 시작
    const eventSource = new EventSource(`/api/notifications/subscribe/${memberId}`)

    eventSource.addEventListener("connect", (event) => {
      console.log("✅ SSE Connected:", event.data)
    })

    // 서버에서 알림 이벤트가 오면
    eventSource.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data)
      // 새 알림을 토스트로 표시
      showToast(notification)
      // 알림 목록에 추가
      setNotifications((prev) => [notification, ...prev])
      // unreadCount 업데이트
      updateUnreadCount()
    })

    // 연결 오류 처리 및 재연결
    eventSource.onerror = (error) => {
      console.error("❌ SSE Error:", error)
      eventSource.close()

      // 5초 후 재연결 시도
      setTimeout(() => {
        setupSSE()
      }, 5000)
    }

    eventSourceRef.current = eventSource
  }

  // 알림 목록 로드
  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${memberId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
  }

  // 읽지 않은 알림 개수 업데이트
  const updateUnreadCount = async () => {
    try {
      const response = await fetch(`/api/notifications/unread-count/${memberId}`)
      if (response.ok) {
        const count = await response.json()
        setUnreadCount(count)
      }
    } catch (error) {
      console.error("Failed to get unread count:", error)
    }
  }

  // 알림 읽음 표시
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })
      if (response.ok) {
        // 로컬 상태 업데이트
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n)),
        )
        // 읽지 않은 수 다시 계산
        updateUnreadCount()
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  // 알림 삭제
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        // 로컬 상태에서 제거
        setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId))
        updateUnreadCount()
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  // 모든 알림 삭제
  const deleteAllNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/member/${memberId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to delete all notifications:", error)
    }
  }

  // 토스트 알림 표시
  const showToast = (notification) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, notification }])
  }

  // 토스트 알림 제거
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
      {/* 토스트 컨테이너 */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <NotificationToast key={toast.id} notification={toast.notification} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
  }

// 알림 컨텍스트 사용을 위한 커스텀 훅
export function useNotification() {
  return useContext(NotificationContext)
}
