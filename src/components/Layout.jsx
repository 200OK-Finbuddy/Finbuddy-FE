import PropTypes from "prop-types"
import Sidebar from "./Sidebar"
import Header from "./Header"
import styles from "../styles/Layout.module.css"

function Layout({ children, navType, onNavChange }) {
  return (
    <div className={styles.layout}>
      <Sidebar activeNav={navType} setActiveNav={onNavChange} />
      <div className={styles.mainContainer}>
        <Header />
        <main className={styles.mainContent}>{children}</main>
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

