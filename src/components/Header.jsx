"use client"

import { useState } from "react"
import { Bell, ChevronDown } from "lucide-react"
import styles from "../styles/Header.module.css"

export default function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* 우측 메뉴 */}
        <div className={styles.rightSection}>
          {/* 알림 버튼 */}
          <button className={styles.iconButton}>
            <Bell size={20} />
            <span className={styles.notificationBadge}>2</span>
          </button>

          {/* 프로필 메뉴 */}
          <div className={styles.profileMenu}>
            <button className={styles.profileButton} onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <span className={styles.profileName}>홍길동</span>
              <ChevronDown size={16} className={styles.chevronIcon} />
            </button>

            {showProfileMenu && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem}>프로필</button>
                <button className={styles.dropdownItem}>설정</button>
                <hr className={styles.dropdownDivider} />
                <button className={styles.dropdownItem}>로그아웃</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

