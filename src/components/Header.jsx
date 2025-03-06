"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import NotificationBell from "./NotificationBell"
import styles from "../styles/Header.module.css"
import PropTypes from "prop-types"

export default function Header({ activeNav, setActiveNav }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()

  const handleNavigation = (path, navType) => {
    setActiveNav(navType)
    navigate(path)
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* 좌측 메뉴 */}
        <div className={styles.leftSection}>
          {/* 로고 추가 */}
          <div className={styles.logo}>
            <img
              src="/image/logo.png"
              alt="Finbuddy"
              onClick={() => handleNavigation("/", "dashboard")}
              style={{ cursor: "pointer", width: "120px", height: "27px" }}
            />
          </div>
        </div>

        {/* mainNav를 독립적인 요소로 분리 */}
        <nav className={styles.mainNav}>
          <ul>
            <li
              className={activeNav === "dashboard" ? styles.active : ""}
              onClick={() => handleNavigation("/dashboard", "dashboard")}
            >
              대시보드
            </li>
            <li
              className={activeNav === "transactions" ? styles.active : ""}
              onClick={() => handleNavigation("/transactions", "transactions")}
            >
              거래내역
            </li>
            <li
              className={activeNav === "products" ? styles.active : ""}
              onClick={() => handleNavigation("/products", "products")}
            >
              금융상품
            </li>
            <li
              className={activeNav === "autotransfer" ? styles.active : ""}
              onClick={() => handleNavigation("/autotransfer", "autotransfer")}
            >
              자동이체 관리
            </li>
            <li
              className={activeNav === "budget" ? styles.active : ""}
              onClick={() => handleNavigation("/budget", "budget")}
            >
              예산 관리
            </li>
          </ul>
        </nav>

        {/* 우측 메뉴 */}
        <div className={styles.rightSection}>
          {/* 알림 버튼 */}
          <NotificationBell />

          {/* 프로필 메뉴 */}
          <div className={styles.profileMenu}>
            <button className={styles.profileButton} onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <span className={styles.profileName}>김진원</span>
              <ChevronDown size={16} className={styles.chevronIcon} />
            </button>

            {showProfileMenu && (
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => handleNavigation("/settings/profile", "profile")}
                >
                  프로필
                </button>
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

Header.propTypes = {
  activeNav: PropTypes.string.isRequired,
  setActiveNav: PropTypes.func.isRequired,
}

