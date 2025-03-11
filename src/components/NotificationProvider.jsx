"use client";

import API_URL from "../config";
import PropTypes from "prop-types";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ 로그인 정보 가져오기
import NotificationToast from "./NotificationToast";

// 알림 컨텍스트 생성
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // 알림 목록
  const [notifications, setNotifications] = useState([]);
  // 읽지 않은 알림 개수
  const [unreadCount, setUnreadCount] = useState(0);
  // 토스트 알림 배열
  const [toasts, setToasts] = useState([]);

  // 로그인 정보 가져오기
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // SSE EventSource를 담을 ref
  const eventSourceRef = useRef(null);

  // 로그인 상태 변화 시 실행
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      updateUnreadCount();
      setupSSE();
    }

    return () => {
      if (eventSourceRef.current) {
        console.log("❌ SSE Connection Closed");
        eventSourceRef.current.close();
      }
    };
  }, [isLoggedIn]);

  // SSE 연결 설정
  const setupSSE = () => {
    if (!isLoggedIn) return;

    const eventSource = new EventSource(`${API_URL}/api/notifications/subscribe`, {
      withCredentials: true, // 쿠키 포함
    });

    eventSource.addEventListener("connect", (event) => {
      console.log("✅ SSE Connected:", event.data);
    });

    eventSource.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data);
      showToast(notification);
      setNotifications((prev) => [notification, ...prev]);
      updateUnreadCount();
    });

    eventSource.onerror = (error) => {
      console.error("❌ SSE Error:", error);
      eventSource.close();
      if (isLoggedIn) {
        setTimeout(() => {
          setupSSE();
        }, 5000);
      }
    };

    eventSourceRef.current = eventSource;
  };

  // 공통 fetch 옵션
  const fetchOptions = {
    credentials: "include", // ✅ 쿠키 포함
    headers: {
      "Content-Type": "application/json",
    },
  };

  // 알림 목록 로드
  const loadNotifications = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications`, fetchOptions);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  // 읽지 않은 알림 개수 업데이트
  const updateUnreadCount = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/unread-count`, fetchOptions);
      if (response.ok) {
        const count = await response.json();
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Failed to get unread count:", error);
    }
  };

  // 알림 읽음 표시
  const markAsRead = async (notificationId) => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        ...fetchOptions,
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
        );
        updateUnreadCount();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId) => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        ...fetchOptions,
        method: "DELETE",
      });
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
        updateUnreadCount();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // 모든 알림 삭제
  const deleteAllNotifications = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/member`, {
        ...fetchOptions,
        method: "DELETE",
      });
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  };

  // 토스트 알림 표시
  const showToast = (notification) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, notification }]);
  };

  // 토스트 알림 제거
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// 알림 컨텍스트 사용을 위한 커스텀 훅
export function useNotification() {
  return useContext(NotificationContext);
}
