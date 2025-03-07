"use client"

import { useState } from "react"
import Modal from "./Modal"
import "../styles/Footer.css"

function Footer() {
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    title: "",
    content: "",
  })

  const openModal = (title, content) => {
    setModalContent({
      isOpen: true,
      title,
      content,
    })
  }

  const closeModal = () => {
    setModalContent({
      ...modalContent,
      isOpen: false,
    })
  }

  // 모달 내용
  const termsContent = (
    <div>
      <h3>제 1 조 (목적)</h3>
      <p>
        이 약관은 핀버디(이하 "회사"라 함)가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무, 책임사항과
        기타 필요한 사항을 규정함을 목적으로 합니다.
      </p>

      <h3>제 2 조 (용어의 정의)</h3>
      <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
      <ul>
        <li>"서비스"란 회사가 제공하는 모든 서비스를 의미합니다.</li>
        <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 개인을 의미합니다.</li>
        <li>
          "아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인하는 문자와 숫자의 조합을
          의미합니다.
        </li>
      </ul>

      <h3>제 3 조 (약관의 효력 및 변경)</h3>
      <p>
        회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항에 게시하거나 기타의 방법으로
        회원에게 공지함으로써 효력이 발생합니다.
      </p>

      <h3>제 4 조 (서비스의 제공 및 변경)</h3>
      <p>
        회사는 회원에게 안정적인 서비스 제공을 위하여 최선을 다하며, 서비스의 내용이 변경되는 경우 변경사항을 사전에
        공지합니다.
      </p>
    </div>
  )

  const privacyContent = (
    <div>
      <h3>1. 개인정보의 수집 및 이용 목적</h3>
      <p>
        회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지
        않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할
        예정입니다.
      </p>
      <ul>
        <li>회원 가입 및 관리</li>
        <li>서비스 제공 및 운영</li>
        <li>마케팅 및 광고에의 활용</li>
        <li>서비스 개선 및 개발</li>
      </ul>

      <h3>2. 수집하는 개인정보 항목</h3>
      <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
      <ul>
        <li>필수항목: 이름, 이메일 주소, 비밀번호, 휴대폰 번호</li>
        <li>선택항목: 프로필 이미지, 주소</li>
        <li>자동수집항목: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록</li>
      </ul>

      <h3>3. 개인정보의 보유 및 이용기간</h3>
      <p>
        회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의
        규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를
        보관합니다.
      </p>

      <h3>4. 개인정보의 파기절차 및 방법</h3>
      <p>
        회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를
        파기합니다.
      </p>
    </div>
  )

  const aboutContent = (
    <div>
      <h3>핀버디 서비스 소개</h3>
      <p>
        핀버디는 사용자의 금융 생활을 더 스마트하고 편리하게 만들어주는 종합 금융 서비스 플랫폼입니다. 계좌 관리, 자산
        분석, 예산 설정, 자동이체 등 다양한 기능을 통해 사용자의 재정 건강을 관리하고 금융 목표 달성을 돕습니다.
      </p>

      <h3>주요 기능</h3>
      <ul>
        <li>
          <strong>계좌 관리:</strong> 여러 금융기관의 계좌를 한 곳에서 확인하고 관리할 수 있습니다.
        </li>
        <li>
          <strong>지출 분석:</strong> 카테고리별 지출 내역을 분석하여 소비 패턴을 파악할 수 있습니다.
        </li>
        <li>
          <strong>예산 설정:</strong> 월별, 카테고리별 예산을 설정하고 관리할 수 있습니다.
        </li>
        <li>
          <strong>자동이체:</strong> 정기적인 이체를 설정하여 자동으로 처리할 수 있습니다.
        </li>
        <li>
          <strong>금융상품 추천:</strong> 사용자의 재정 상황에 맞는 최적의 금융상품을 추천받을 수 있습니다.
        </li>
      </ul>

      <h3>핀버디 팀</h3>
      <p>
        핀버디는 금융과 기술에 대한 열정을 가진 전문가들로 구성된 팀이 개발했습니다. 사용자의 금융 건강을 최우선으로
        생각하며, 안전하고 혁신적인 서비스를 제공하기 위해 노력하고 있습니다.
      </p>

      <h3>연락처</h3>
      <p>서비스에 대한 문의사항이 있으시면 아래 연락처로 문의해주세요:</p>
      <p>이메일: support@finbuddy.co.kr</p>
      <p>전화: 1588-0000</p>
    </div>
  )

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h2 className="footer-logo">FINBUDDY</h2>
          <p className="footer-team">Team 200ok | 손혜정 · 심세연 · 최준영</p>
          <p className="footer-copyright">Copyright FinBuddy. All rights reserved</p>
        </div>
        <div className="footer-right">
          <nav className="footer-nav">
            <button className="footer-link" onClick={() => openModal("이용약관", termsContent)}>
              이용약관
            </button>
            <button className="footer-link" onClick={() => openModal("개인정보처리방침", privacyContent)}>
              개인정보처리방침
            </button>
            <button className="footer-link" onClick={() => openModal("서비스소개", aboutContent)}>
              서비스소개
            </button>
          </nav>
        </div>
      </div>

      <Modal isOpen={modalContent.isOpen} onClose={closeModal} title={modalContent.title}>
        {modalContent.content}
      </Modal>
    </footer>
  )
}

export default Footer

