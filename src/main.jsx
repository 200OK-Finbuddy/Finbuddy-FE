import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { NotificationProvider } from "./components/NotificationProvider"
import "./index.css"
import { AuthProvider } from "./context/AuthContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <AuthProvider> */}
        {/* 변경 없음: App 전체를 NotificationProvider로 감싸서 알림 전역 관리 */}
        <NotificationProvider>
          <App />
        </NotificationProvider>
      {/* </AuthProvider> */}
    </BrowserRouter>
  </React.StrictMode>,
)
