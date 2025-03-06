"use client"

import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"
import { Menu, X } from "lucide-react"
import styles from "../styles/Layout.module.css"

function Layout({ children, navType, onNavChange }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className={styles.layout}>
      {isMobile && (
        <button
          className={styles.sidebarToggle}
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "닫기" : "메뉴 열기"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {isMobile && (
        <div
          className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.visible : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}>
        <Sidebar activeNav={navType} setActiveNav={onNavChange} />
      </div>

      <div className={styles.mainContainer}>
        <Header />
        <main className={styles.mainContent}>{children}</main>
        <Footer />
      </div>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  navType: PropTypes.string.isRequired,
  onNavChange: PropTypes.func.isRequired,
}

export default Layout

