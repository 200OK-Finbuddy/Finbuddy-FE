"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BarChart2, CreditCard, PieChart, RefreshCw, Shield, Smartphone, Users } from "lucide-react"
import Footer from "./Footer"
import AccountLinkModal from "./AccountLinkModal"
import Header from "../components/Header"
import "../styles/MainPage.css"

const MainPage = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeNav, setActiveNav] = useState("dashboard")

  // 실제 환경에서는 로그인한 사용자의 ID를 가져와야 합니다
  // 여기서는 예시로 1을 사용합니다
  const memberId = 4

  const isLoggedIn = true

  const handleConnectAccount = () => {
    // 로그인 상태 확인 (실제 구현에서는 상태 관리 라이브러리나 컨텍스트를 사용할 수 있습니다)
    const isLoggedIn = true // 예시로 true로 설정

    if (isLoggedIn) {
      setIsModalOpen(true)
    } else {
      navigate("/login")
    }
  }

  const navigateToFeature = (path) => {
    navigate(path)
  }

  return (
    <div className="main-page">
      {/* 헤더 섹션 */}
      <Header activeNav={activeNav} setActiveNav={setActiveNav} isLoggedIn={isLoggedIn} />

      {/* 히어로 섹션 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            당신의 재정 건강을 위한
            <br />
            스마트한 동반자
          </h1>
          <p>핀버디와 함께 쉽고 효율적으로 자산을 관리하고 재정 목표를 달성하세요.</p>
          <button className="cta-button" onClick={handleConnectAccount}>
            계좌 연동하기 <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-image">
          <img src="/image/fin-image1.png" alt="금융 일러1" style={{  width: '300px', height: '400px' }} />
          <img src="/image/fin-image2.png" alt="금융 일러2" style={{  width: '310px', height: '420px' }} />
        </div>
      </section>

      {/* 서비스 소개 섹션 */}
      <section className="intro-section">
        <h2>핀버디가 특별한 이유</h2>
        <div className="intro-features">
          <div className="intro-feature">
            <Shield className="intro-icon" />
            <h3>안전한 데이터 보호</h3>
            <p>은행 수준의 보안으로 모든 금융 데이터를 안전하게 보호합니다.</p>
          </div>
          <div className="intro-feature">
            <Smartphone className="intro-icon" />
            <h3>간편한 사용성</h3>
            <p>복잡한 금융 정보를 직관적인 인터페이스로 쉽게 관리할 수 있습니다.</p>
          </div>
          <div className="intro-feature">
            <BarChart2 className="intro-icon" />
            <h3>맞춤형 인사이트</h3>
            <p>개인화된 분석으로 더 나은 재정 결정을 내릴 수 있도록 도와드립니다.</p>
          </div>
        </div>
      </section>

      {/* 주요 기능 소개 섹션 */}
      <section className="features-section">
        <h2>핀버디의 주요 기능</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <CreditCard className="feature-icon" />
            <h3>계좌 관리</h3>
            <p>여러 은행의 계좌를 한 곳에서 편리하게 관리하고 잔액을 실시간으로 확인하세요.</p>
            <button className="feature-button" onClick={() => navigateToFeature("/dashboard")}>
              바로가기 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <PieChart className="feature-icon" />
            <h3>지출 분석</h3>
            <p>카테고리별 지출 패턴을 시각적으로 분석하여 소비 습관을 개선하세요.</p>
            <button className="feature-button" onClick={() => navigateToFeature("/transactions")}>
              바로가기 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <BarChart2 className="feature-icon" />
            <h3>예산 관리</h3>
            <p>카테고리별 예산을 설정하고 지출을 추적하여 재정 목표를 달성하세요.</p>
            <button className="feature-button" onClick={() => navigateToFeature("/budget")}>
              바로가기 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <RefreshCw className="feature-icon" />
            <h3>자동이체 관리</h3>
            <p>정기적인 이체를 자동화하여 중요한 납부를 놓치지 않도록 관리하세요.</p>
            <button className="feature-button" onClick={() => navigateToFeature("/autotransfer")}>
              바로가기 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="stats-section">
        <div className="stat-item">
          <h3>100,000+</h3>
          <p>사용자</p>
          <Users className="stat-icon" />
        </div>
        <div className="stat-item">
          <h3>5조+</h3>
          <p>관리 자산</p>
          <CreditCard className="stat-icon" />
        </div>
        <div className="stat-item">
          <h3>30%+</h3>
          <p>평균 절약률</p>
          <BarChart2 className="stat-icon" />
        </div>
      </section>

      {/* 최종 CTA 섹션 */}
      <section className="final-cta">
        <h2>지금 바로 시작하세요</h2>
        <p>핀버디와 함께 더 스마트한 금융 생활을 경험하세요.</p>
        <button className="cta-button" onClick={handleConnectAccount}>
          계좌 연동하기 <ArrowRight size={18} />
        </button>
      </section>

      {/* 푸터 */}
      <Footer />

      {/* 계좌 연동 모달 */}
      <AccountLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} memberId={memberId} />
    </div>
  )
}

export default MainPage

