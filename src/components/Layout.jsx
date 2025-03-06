"use client"

import PropTypes from "prop-types"
import Header from "./Header"
import Footer from "./Footer"
import styles from "../styles/Layout.module.css"

function Layout({ children, navType, onNavChange }) {
  return (
    <div className={styles.layout}>
      <div className={styles.mainContainer}>
        <Header activeNav={navType} setActiveNav={onNavChange} />
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

