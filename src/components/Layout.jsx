import PropTypes from "prop-types";
import Sidebar from "./Sidebar"
import NotificationBell from "./NotificationBell"
import "../styles/App.css"

function Layout({ children, navType, onNavChange }) {
  return (
    <div className="app">
      <Sidebar activeNav={navType} setActiveNav={onNavChange} />
      <div className="main-container">
        <header className="main-header">
          <div className="header-actions">
            {/* 알림 버튼 */}
            <NotificationBell />
            <div className="user-profile">
              {/* <img src="/placeholder.svg?height=32&width=32" alt="User" className="user-avatar" /> */}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

export default Layout

Layout.propTypes = {
    children: PropTypes.node.isRequired, // children은 node 타입 (React 요소 또는 문자열, 숫자 등)
    navType: PropTypes.string.isRequired, // navType은 문자열
    onNavChange: PropTypes.func.isRequired, // onNavChange는 함수
  };
