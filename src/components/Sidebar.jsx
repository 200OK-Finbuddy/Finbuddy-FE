"use client"

import { BarChart2, Users, Send, CreditCard, UserCircle, RefreshCw, Wallet, Cloud } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import PropTypes from "prop-types"
import "../styles/Sidebar.css"

function Sidebar({ activeNav, setActiveNav }) {
  const navigate = useNavigate()
  const location = useLocation()

  // 페이지 로드 시 한 번만 실행되도록 빈 의존성 배열 사용
  useEffect(() => {
    // URL 경로에 따라 적절한 네비게이션 상태 설정
    const path = location.pathname

    if (path.includes("/dashboard")) {
      setActiveNav("dashboard")
    } else if (path.includes("/transactions")) {
      setActiveNav("transactions")
    } else if (path.includes("/transfer")) {
      setActiveNav("transfer")
    } else if (path.includes("/products")) {
      setActiveNav("products")
    } else if (path.includes("/settings/profile")) {
      setActiveNav("profile")
    } else if (path.includes("/autotransfer")) {
      setActiveNav("autotransfer")
    } else if (path.includes("/budget")) {
      setActiveNav("budget")
    }
  }, [location.pathname, setActiveNav]) // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  const handleNavigation = (path, navType) => {
    setActiveNav(navType)
    navigate(path)
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <Cloud size={20} />
        <span> Finbuddy</span>
      </div>
      <nav className="nav-menu">
        <ul>
          <li
            className={activeNav === "dashboard" ? "active" : ""}
            onClick={() => handleNavigation("/dashboard", "dashboard")}
          >
            <BarChart2 size={20} />
            <span>대시보드</span>
          </li>
          <li
            className={activeNav === "transactions" ? "active" : ""}
            onClick={() => handleNavigation("/transactions", "transactions")}
          >
            <Users size={20} />
            <span>거래내역</span>
          </li>
          <li
            className={activeNav === "transfer" ? "active" : ""}
            onClick={() => handleNavigation("/transfer", "transfer")}
          >
            <Send size={20} />
            <span>이체하기</span>
          </li>
          <li
            className={activeNav === "products" ? "active" : ""}
            onClick={() => handleNavigation("/products", "products")}
          >
            <CreditCard size={20} />
            <span>금융상품</span>
          </li>
          <li
            className={activeNav === "profile" ? "active" : ""}
            onClick={() => handleNavigation("/settings/profile", "profile")}
          >
            <UserCircle size={20} />
            <span>회원정보 수정</span>
          </li>
          <li
            className={activeNav === "autotransfer" ? "active" : ""}
            onClick={() => handleNavigation("/autotransfer", "autotransfer")}
          >
            <RefreshCw size={20} />
            <span>자동이체 관리</span>
          </li>
          <li className={activeNav === "budget" ? "active" : ""} onClick={() => handleNavigation("/budget", "budget")}>
            <Wallet size={20} />
            <span>예산 관리</span>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

Sidebar.propTypes = {
  activeNav: PropTypes.string.isRequired,
  setActiveNav: PropTypes.func.isRequired,
}

export default Sidebar

