"use client"

import { useNavigate } from "react-router-dom"
import { UserCircle, ArrowRight, RefreshCw, Wallet } from "lucide-react"
import styles from "../styles/Settings.module.css"

export default function Settings() {
  const navigate = useNavigate()

  const settingsMenus = [
    {
      id: "profile",
      title: "회원정보 수정",
      description: "개인정보와 계정 설정을 관리합니다.",
      icon: <UserCircle className={styles.menuIcon} />,
      path: "/settings/profile",
    },
    {
      id: "autotransfer",
      title: "자동이체 관리",
      description: "자동이체 설정을 확인하고 관리합니다.",
      icon: <RefreshCw className={styles.menuIcon} />,
      path: "/autotransfer",
    },
    {
      id: "budget",
      title: "예산 관리",
      description: "월별 지출 예산을 설정하고 관리합니다.",
      icon: <Wallet className={styles.menuIcon} />,
      path: "/budget",
    },
  ]

  return (
    <main className="main-content">
      <header className="welcome-section">
        <h1>환영합니다. 👋</h1>
        <p>주간 온라인 거래 내역을 확인하세요.</p>
      </header>

      <div className="content-container">
        <div className="page-header">
          <h2 className="page-title">설정</h2>
        </div>

        <div className={styles.menuGrid}>
          {settingsMenus.map((menu) => (
            <button key={menu.id} className={styles.menuCard} onClick={() => navigate(menu.path)}>
              <div className={styles.menuContent}>
                <div className={styles.menuIcon}>{menu.icon}</div>
                <div className={styles.menuInfo}>
                  <h3 className={styles.menuTitle}>{menu.title}</h3>
                  <p className={styles.menuDescription}>{menu.description}</p>
                </div>
              </div>
              <ArrowRight className={styles.arrowIcon} />
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

